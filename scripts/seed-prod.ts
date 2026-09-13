import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "../lib/rbac-data";
import { avatarUrlFor } from "../lib/avatar";

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
      photoUrl: avatarUrlFor(email),
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
      name: "Techninja",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 4,
      status: "OPEN" as const,
      venue: "VVIT Campus - Lab Block",
      date: new Date("2026-10-09T09:00:00.000Z"),
      rules: "Faculty: M G Kousar | Students: Sam Goldwin, Rahul",
    },
    {
      name: "VV care",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 2,
      maxTeamSize: 5,
      status: "OPEN" as const,
      venue: "VVIT Campus - Open Ground",
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Faculty: Rajani M, M G Kousar | Students: Shrishty, Lalitha",
    },
    {
      name: "Cooking Without Fire",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 150,
      minTeamSize: 2,
      maxTeamSize: 3,
      status: "OPEN" as const,
      venue: "VVIT Campus - Food Court",
      date: new Date("2026-10-09T11:00:00.000Z"),
      rules: "Faculty: Rashmi Rani Samantaray | Students: Anushka S (+91 81971 97536), Arshiya (+91 90081 50803)",
    },
    {
      name: "Talent mania",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      venue: "Main Auditorium",
      date: new Date("2026-10-09T09:00:00.000Z"),
      rules: "Faculty: Kavyashree J | Students: Shree Kyathi, Harshitha",
    },
    {
      name: "Collage (Best out of waste)",
      category: "FINE_ARTS",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "OPEN" as const,
      venue: "Seminar Hall 1",
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Faculty: Sushma B M, Bharathi J | Students: Harish (9901709596), Divya C (8074142405)",
    },
    {
      name: "ICEBREAKER",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 3,
      maxTeamSize: 6,
      status: "OPEN" as const,
      venue: "Open Air Theatre",
      date: new Date("2026-10-10T09:00:00.000Z"),
      rules: "Faculty: Swetha/Harini | Students: Lokhapradeep (9632425042), Harish P (9901709596), Deekshitha A (7892563979)",
    },
    {
      name: "Dumb charades",
      category: "THEATRE",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 2,
      maxTeamSize: 5,
      status: "OPEN" as const,
      venue: "Seminar Hall 2",
      date: new Date("2026-10-10T09:00:00.000Z"),
      rules: "Faculty: Supriya | Students: Dhikshitha A (7892563979), Divya C (8792354155)",
    },
    {
      name: "Code Conflux",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 150,
      minTeamSize: 1,
      maxTeamSize: 3,
      status: "OPEN" as const,
      venue: "Central Computing Lab",
      date: new Date("2026-10-10T10:00:00.000Z"),
      rules: "Faculty: V Vanitha, Rashmi Rani | Students: Anushka (8197197536), Mohammed Ghouse, Daniel (9380987187)",
    },
    {
      name: "Dance Elite",
      category: "DANCE",
      type: "TEAM" as const,
      price: 200,
      minTeamSize: 3,
      maxTeamSize: 10,
      status: "OPEN" as const,
      venue: "Main Auditorium",
      date: new Date("2026-10-10T11:00:00.000Z"),
      rules: "Faculty: J Bharathi | Students: Krishnaveni H K (9743116619), Lahari M (8884084501), Bhoomika (7975535763)",
    },
    {
      name: "BGMI",
      category: "GAMING",
      type: "TEAM" as const,
      price: 200,
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "OPEN" as const,
      venue: "E-Sports Arena",
      date: new Date("2026-10-10T12:00:00.000Z"),
      rules: "Faculty: Subhrajit Sengupta | Students: Arshad (7795811494), Charan (6362348311)",
    },
  ];

  // prune stale placeholder events
  const keepNames = events.map(e => e.name);
  await prisma.event.deleteMany({ where: { name: { notIn: keepNames } } });

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