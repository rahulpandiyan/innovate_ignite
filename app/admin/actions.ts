"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/authCookie";
import {
  assertPermission,
  PERMISSIONS,
} from "@/lib/rbac";
import bcrypt from "bcryptjs";

async function requireAdmin(permission?: string) {
  const session = await getAuthSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Not authorized");
  }
  if (permission) {
    const err = await assertPermission(session.id, permission as never);
    if (err) throw new Error("Not authorized");
  }
  return session;
}

export async function createCollege(input: {
  name: string;
  code: string;
  region?: string;
  address?: string;
}) {
  const admin = await requireAdmin(PERMISSIONS.COLLEGES_MANAGE);
  const exists = await prisma.college.findUnique({ where: { code: input.code } });
  if (exists) throw new Error(`College with code ${input.code} already exists`);
  const college = await prisma.college.create({
    data: {
      name: input.name,
      code: input.code,
      region: input.region ?? null,
      address: input.address ?? null,
    },
  });
  await prisma.auditLog.create({
    data: {
      action: "COLLEGE_CREATED",
      userId: admin.id,
      entityType: "College",
      entityId: college.id,
      details: { code: input.code, name: input.name },
    },
  });
  revalidatePath("/admin/colleges");
  return { ok: true };
}

export async function createEvent(input: {
  name: string;
  description?: string;
  type: "SOLO" | "TEAM";
  category: string;
  venue: string;
  price: number;
  minTeamSize: number;
  maxTeamSize: number;
  date: string;
  registrationStart: string;
  registrationEnd: string;
  status: "DRAFT" | "OPEN" | "REGISTRATION_CLOSED" | "ONGOING" | "COMPLETED";
  coordinatorId?: string;
  judgeId?: string;
}) {
  const admin = await requireAdmin(PERMISSIONS.EVENTS_CREATE);
  const event = await prisma.event.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      category: input.category,
      venue: input.venue,
      price: input.price,
      minTeamSize: input.minTeamSize,
      maxTeamSize: input.maxTeamSize,
      date: new Date(input.date),
      registrationStart: new Date(input.registrationStart),
      registrationEnd: new Date(input.registrationEnd),
      status: input.status,
      createdById: admin.id,
    },
  });
  if (input.coordinatorId) {
    await prisma.eventCoordinator.upsert({
      where: {
        eventId_userId: { eventId: event.id, userId: input.coordinatorId },
      },
      update: {},
      create: { eventId: event.id, userId: input.coordinatorId },
    });
  }
  if (input.judgeId) {
    await prisma.judge.upsert({
      where: { eventId_userId: { eventId: event.id, userId: input.judgeId } },
      update: {},
      create: { eventId: event.id, userId: input.judgeId },
    });
  }
  await prisma.auditLog.create({
    data: {
      action: "EVENT_CREATED",
      userId: admin.id,
      entityType: "Event",
      entityId: event.id,
      details: { name: input.name },
    },
  });
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function assignEventUsers(input: {
  eventId: string;
  coordinatorId?: string;
  judgeId?: string;
  unassignCoordinator?: boolean;
  unassignJudge?: boolean;
}) {
  await requireAdmin(PERMISSIONS.EVENTS_MANAGE);
  if (input.coordinatorId) {
    await prisma.eventCoordinator.upsert({
      where: {
        eventId_userId: { eventId: input.eventId, userId: input.coordinatorId },
      },
      update: {},
      create: { eventId: input.eventId, userId: input.coordinatorId },
    });
  }
  if (input.judgeId) {
    await prisma.judge.upsert({
      where: { eventId_userId: { eventId: input.eventId, userId: input.judgeId } },
      update: {},
      create: { eventId: input.eventId, userId: input.judgeId },
    });
  }
  if (input.unassignCoordinator) {
    await prisma.eventCoordinator.deleteMany({
      where: { eventId: input.eventId },
    });
  }
  if (input.unassignJudge) {
    await prisma.judge.deleteMany({ where: { eventId: input.eventId } });
  }
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function updateEventStatus(input: { eventId: string; status: string }) {
  await requireAdmin(PERMISSIONS.EVENTS_MANAGE);
  await prisma.event.update({
    where: { id: input.eventId },
    data: { status: input.status as never },
  });
  revalidatePath("/admin/events");
  return { ok: true };
}

const ROLES = [
  "SUPER_ADMIN",
  "COLLEGE_ADMIN",
  "TEAM_LEADER",
  "PARTICIPANT",
  "EVENT_COORDINATOR",
  "JUDGE",
  "ATTENDANCE_STAFF",
  "FINANCE_ADMIN",
  "CERTIFICATE_ADMIN",
];

export async function setUserRole(input: { userId: string; roleName: string }) {
  const admin = await requireAdmin(PERMISSIONS.USERS_MANAGE);
  if (!ROLES.includes(input.roleName)) throw new Error("Invalid role");
  const role = await prisma.userRole.findUnique({ where: { name: input.roleName } });
  if (!role) throw new Error("Unknown role");
  await prisma.user.update({
    where: { id: input.userId },
    data: { roleId: role.id },
  });
  await prisma.auditLog.create({
    data: {
      action: "ROLE_ASSIGNED",
      userId: admin.id,
      entityType: "User",
      entityId: input.userId,
      details: { role: input.roleName },
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  password: string;
  roleName: string;
  collegeCode?: string;
}) {
  const admin = await requireAdmin(PERMISSIONS.USERS_MANAGE);
  if (!ROLES.includes(input.roleName)) throw new Error("Invalid role");
  const role = await prisma.userRole.findUnique({ where: { name: input.roleName } });
  if (!role) throw new Error("Unknown role");
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new Error("User with this email already exists");
  const college = input.collegeCode
    ? await prisma.college.findUnique({ where: { code: input.collegeCode } })
    : null;
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      collegeName: input.collegeName,
      password: await bcrypt.hash(input.password, 8),
      role: input.roleName === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PARTICIPANT",
      roleId: role.id,
      collegeId: college?.id ?? null,
    },
  });
  await prisma.auditLog.create({
    data: {
      action: "USER_UPDATED",
      userId: admin.id,
      entityType: "User",
      entityId: user.id,
      details: { email: input.email, role: input.roleName },
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}