import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "../lib/rbac-data";

const prisma = new PrismaClient();

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

async function seedColleges() {
  const colleges = [
    { name: "Vijaya Vittala Institute Of Technology", code: "GA-047", region: "Bengaluru" },
    { name: "B.M.S. COLLEGE OF ENGINEERING", code: "BMS-021", region: "Bengaluru" },
    { name: "RAMAIAH INSTITUTE OF TECHNOLOGY", code: "RIT-014", region: "Bengaluru" },
  ];
  for (const c of colleges) {
    await prisma.college.upsert({
      where: { code: c.code },
      update: { name: c.name, region: c.region },
      create: { name: c.name, code: c.code, region: c.region },
    });
  }
  console.log(`colleges: ${colleges.length}`);
}

async function seedSuperAdmin() {
  const email = process.env.PROD_ADMIN_EMAIL ?? "bhuvan.ar0101@gmail.com";
  const password =
    process.env.PROD_ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
  const hash = await bcrypt.hash(password, 8);
  const role = await prisma.userRole.findUnique({ where: { name: "SUPER_ADMIN" } });
  const user = await prisma.user.upsert({
    where: { email },
    update: { roleId: role?.id, ...(process.env.PROD_ADMIN_PASSWORD ? { password: hash } : {}) },
    create: {
      name: "Super Admin",
      email,
      phone: "",
      collegeName: "Platform Admin",
      password: hash,
      emailVerified: true,
      role: "SUPER_ADMIN",
      roleId: role?.id,
    },
  });
  console.log(`super admin: ${email}`);
  if (!process.env.PROD_ADMIN_PASSWORD) {
    console.log(`GENERATED_PASSWORD=${password}  (change it after first login)`);
  }
  return user;
}

async function seedEvents(superAdminId: string) {
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
    },
  ];

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
      console.log(`event created: ${ev.name}`);
    }
  }
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedColleges();
  const admin = await seedSuperAdmin();
  await seedEvents(admin.id);
  console.log("prod seed done");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });