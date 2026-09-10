import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "../lib/rbac-data";

const prisma = new PrismaClient();

async function nextId(entity: string, prefix: string, pad = 6): Promise<string> {
  const c = await prisma.idCounter.upsert({
    where: { entity },
    update: { value: { increment: 1 } },
    create: { entity, value: 1 },
  });
  return `${prefix}${String(c.value).padStart(pad, "0")}`;
}

async function seedPermissions() {
  for (const name of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: name },
    });
  }
  console.log(`permissions: ${ALL_PERMISSIONS.length}`);
}

async function seedRoles() {
  for (const role of ROLES) {
    const r = await prisma.userRole.upsert({
      where: { name: role },
      update: {},
      create: { name: role, description: `${role} role`, isSystem: true },
    });
    const permNames = ROLE_PERMISSIONS[role];
    const perms = await prisma.permission.findMany({ where: { name: { in: permNames } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: r.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: r.id, permissionId: p.id })),
    });
  }
  console.log(`roles: ${ROLES.join(", ")}`);
}

async function upsertUser(data: {
  email: string;
  phone: string;
  name: string;
  collegeName: string;
  password: string;
  roleName: string;
  collegeCode?: string;
}) {
  const password = await bcrypt.hash(data.password, 8);
  const roleRecord = await prisma.userRole.findUnique({ where: { name: data.roleName } });
  const college = data.collegeCode
    ? await prisma.college.findUnique({ where: { code: data.collegeCode } })
    : undefined;
  return prisma.user.upsert({
    where: { email: data.email },
    update: { roleId: roleRecord?.id, collegeId: college?.id ?? null },
    create: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      collegeName: data.collegeName,
      password,
      emailVerified: true,
      role: data.roleName === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PARTICIPANT",
      roleId: roleRecord?.id,
      collegeId: college?.id,
    },
  });
}

async function seedColleges() {
  const colleges = [
    { name: "GLOBAL ACADEMY OF TECHNOLOGY", code: "GA-047", region: "Bengaluru" },
    { name: "B.M.S. COLLEGE OF ENGINEERING", code: "BMS-021", region: "Bengaluru" },
    { name: "RAMAIAH INSTITUTE OF TECHNOLOGY", code: "RIT-014", region: "Bengaluru" },
  ];
  const out = [];
  for (const c of colleges) {
    const row = await prisma.college.upsert({
      where: { code: c.code },
      update: { name: c.name, region: c.region },
      create: { name: c.name, code: c.code, region: c.region },
    });
    out.push(row);
  }
  console.log(`colleges: ${out.length}`);
  return out;
}

async function seedEvents(superAdminId: string, coordinatorId: string, judgeId: string) {
  const events = [
    {
      name: "Solo Dance",
      category: "DANCE",
      type: "SOLO" as const,
      price: 150,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      venue: "Main Auditorium",
      date: new Date("2026-11-20T09:00:00.000Z"),
      rules: "Any genre. 3-5 minutes.",
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
    },
    {
      name: "A Cappella",
      category: "MUSIC",
      type: "TEAM" as const,
      price: 300,
      minTeamSize: 3,
      maxTeamSize: 8,
      status: "OPEN" as const,
      venue: "Seminar Hall 2",
      date: new Date("2026-11-20T11:00:00.000Z"),
      rules: "No instruments. Max 8 members.",
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
    },
    {
      name: "Street Play",
      category: "THEATRE",
      type: "TEAM" as const,
      price: 500,
      minTeamSize: 5,
      maxTeamSize: 15,
      status: "OPEN" as const,
      venue: "Open Air Theatre",
      date: new Date("2026-11-21T10:00:00.000Z"),
      rules: "15-20 minutes.",
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
    },
    {
      name: "Battle of Bands",
      category: "MUSIC",
      type: "TEAM" as const,
      price: 750,
      minTeamSize: 3,
      maxTeamSize: 6,
      status: "REGISTRATION_CLOSED" as const,
      venue: "Main Auditorium",
      date: new Date("2026-11-21T17:00:00.000Z"),
      rules: "Original compositions preferred.",
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
    },
  ];

  const registeredEvents = [];
  for (const ev of events) {
    let event = await prisma.event.findFirst({ where: { name: ev.name } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          name: ev.name,
          description: ev.rules,
          type: ev.type,
          category: ev.category,
          price: ev.price,
          date: ev.date,
          venue: ev.venue,
          rules: ev.rules,
          minTeamSize: ev.minTeamSize,
          maxTeamSize: ev.maxTeamSize,
          status: ev.status,
          registrationStart: new Date("2026-09-01T00:00:00.000Z"),
          registrationEnd: new Date("2026-11-10T00:00:00.000Z"),
          createdById: superAdminId,
        },
      });
    }
    await prisma.eventCoordinator.upsert({
      where: { eventId_userId: { eventId: event.id, userId: ev.assignCoordinatorId } },
      update: {},
      create: { eventId: event.id, userId: ev.assignCoordinatorId },
    });
    await prisma.judge.upsert({
      where: { eventId_userId: { eventId: event.id, userId: ev.assignJudgeId } },
      update: {},
      create: { eventId: event.id, userId: ev.assignJudgeId },
    });
    registeredEvents.push(event);
  }
  console.log(`events: ${registeredEvents.length}`);
  return registeredEvents;
}

async function main() {
  await seedPermissions();
  await seedRoles();
  const colleges = await seedColleges();

  const superAdmin = await upsertUser({
    email: "bhuvan.ar0101@gmail.com",
    phone: "+919812341111",
    name: "Bhuvan A R",
    collegeName: "Platform Admin",
    password: "Admin@1234",
    roleName: "SUPER_ADMIN",
  });

  const coordinator = await upsertUser({
    email: "coordinator.demo@gmail.com",
    phone: "+919812342222",
    name: "Meera Nair",
    collegeName: "Platform Admin",
    password: "Coord@1234",
    roleName: "EVENT_COORDINATOR",
  });
  const judge = await upsertUser({
    email: "judge.demo@gmail.com",
    phone: "+919812343333",
    name: "Vikram Rao",
    collegeName: "Platform Admin",
    password: "Judge@1234",
    roleName: "JUDGE",
  });
  await upsertUser({
    email: "finance.demo@gmail.com",
    phone: "+919812344444",
    name: "Anita Shetty",
    collegeName: "Platform Admin",
    password: "Finance@1234",
    roleName: "FINANCE_ADMIN",
  });
  await upsertUser({
    email: "cert.demo@gmail.com",
    phone: "+919812345555",
    name: "Karthik Verma",
    collegeName: "Platform Admin",
    password: "Cert@1234",
    roleName: "CERTIFICATE_ADMIN",
  });
  await upsertUser({
    email: "attendance.demo@gmail.com",
    phone: "+919812346666",
    name: "Shreya Menon",
    collegeName: "Platform Admin",
    password: "Attend@1234",
    roleName: "ATTENDANCE_STAFF",
  });

  const gat = colleges.find((c) => c.code === "GA-047")!;
  const collegeAdmin = await upsertUser({
    email: "college.demo@gmail.com",
    phone: "+919812347777",
    name: "Prof. Lakshmi Rao",
    collegeName: gat.name,
    password: "College@1234",
    roleName: "COLLEGE_ADMIN",
    collegeCode: gat.code,
  });

  const p1 = await upsertUser({
    email: "p1.demo@gmail.com",
    phone: "+919812348888",
    name: "Aarav Sharma",
    collegeName: gat.name,
    password: "Pass@1234",
    roleName: "PARTICIPANT",
    collegeCode: gat.code,
  });
  const p2 = await upsertUser({
    email: "p2.demo@gmail.com",
    phone: "+919812349999",
    name: "Diya Patel",
    collegeName: gat.name,
    password: "Pass@1234",
    roleName: "PARTICIPANT",
    collegeCode: gat.code,
  });

  for (const u of [collegeAdmin, p1, p2]) {
    await prisma.participant.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, collegeId: gat.id, participantId: await nextId("PARTICIPANT", "VTU26-") },
    });
  }

  const events = await seedEvents(superAdmin.id, coordinator.id, judge.id);

  const soloDance = events.find((e) => e.name === "Solo Dance")!;
  const acappella = events.find((e) => e.name === "A Cappella")!;

  const par1 = await prisma.participant.findUnique({ where: { userId: p1.id } });
  const par2 = await prisma.participant.findUnique({ where: { userId: p2.id } });

  async function makeRegistration(registration: {
    user: { id: string };
    event: { id: string };
    collegeId: string;
    status: "PENDING" | "CONFIRMED";
    paymentStatus: "SUCCESS" | "PENDING";
    teamSize: number;
  }) {
    const existing = await prisma.registration.findFirst({
      where: { userId: registration.user.id, eventId: registration.event.id },
    });
    if (existing) return existing;
    return prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          registrationId: await nextId("REGISTRATION", "REG-"),
          userId: registration.user.id,
          eventId: registration.event.id,
          collegeId: registration.collegeId,
          formResponses: { name: registration.user.id },
          status: registration.status,
        },
      });
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: registration.event.id === soloDance.id ? 150 : 300,
          status: registration.paymentStatus,
          transactionId:
            registration.paymentStatus === "SUCCESS" ? "UPI" + Math.floor(Math.random() * 1e8) : null,
          confirmedAt:
            registration.paymentStatus === "SUCCESS" ? new Date() : null,
          verifiedBy: registration.paymentStatus === "SUCCESS" ? null : null,
        },
      });
      const participantRow = await tx.participant.findUnique({ where: { userId: registration.user.id } });
      const attendee = await tx.attendee.create({
        data: {
          registrationId: reg.id,
          participantId: participantRow!.id,
          attendeeId: await nextId("ATTENDEE", "ATT-"),
        },
      });
      await tx.qRPass.create({
        data: { attendeeId: attendee.id, token: "QR-" + crypto.randomUUID() },
      });
      await tx.attendance.create({
        data: {
          attendeeId: attendee.id,
          eventId: registration.event.id,
          registrationId: reg.id,
          status: registration.paymentStatus === "SUCCESS" ? "CHECKED_IN" : "NOT_CHECKED_IN",
          checkedInAt: registration.paymentStatus === "SUCCESS" ? new Date() : null,
          checkedBy: registration.user.id,
        },
      });
      return reg;
    });
  }

  await makeRegistration({
    user: p1,
    event: soloDance,
    collegeId: gat.id,
    status: "CONFIRMED",
    paymentStatus: "SUCCESS",
    teamSize: 1,
  });
  await makeRegistration({
    user: p2,
    event: acappella,
    collegeId: gat.id,
    status: "PENDING",
    paymentStatus: "PENDING",
    teamSize: 1,
  });

  // ── Slice 1 demo: team, invite, order ────────────────────────────────────
  const existingTeam = await prisma.team.findFirst({ where: { name: "Resonance Crew" } });
  if (!existingTeam) {
    const bop = events.find((e) => e.name === "Battle of Bands")!;
    const team = await prisma.team.create({
      data: { name: "Resonance Crew", eventId: bop.id, leaderId: p1.id },
    });
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: p1.id, role: "LEADER" },
    });
    await prisma.teamInvite.create({
      data: {
        id: randomUUID(),
        teamId: team.id,
        invitedUserId: p2.id,
        invitedById: p1.id,
        status: "PENDING",
      },
    });
  }

  const existingOrder = await prisma.order.findFirst({ where: { userId: p1.id } });
  if (!existingOrder) {
    const bop = events.find((e) => e.name === "Battle of Bands")!;
    await prisma.order.create({
      data: {
        userId: p1.id,
        totalAmount: bop.price,
        status: "PENDING_PAYMENT",
        orderItems: { create: [{ eventId: bop.id, price: bop.price }] },
      },
    });
  }

  console.log("seed done");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });