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
  const email = process.env.PROD_ADMIN_EMAIL ?? "rahul.legend345@gmail.com";
  const password =
    process.env.PROD_ADMIN_PASSWORD ?? "Rahul@980";
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
      rules: "Faculty: Rajani M, M G Kousar | Students: Shrishty, Lalitha",
    },
    {
      name: "Mini Project [Presentation]",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 4,
      status: "OPEN" as const,
      rules: "Faculty: Rashmi Rani Samantaray",
    },
    {
      name: "Code Conflux",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 150,
      minTeamSize: 1,
      maxTeamSize: 3,
      status: "OPEN" as const,
      rules: "Faculty: V Vanitha, Rashmi Rani | Students: Anushka, Mohammed Ghouse, Daniel",
    },
    {
      name: "Symposium (Group Discussion)",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 4,
      status: "OPEN" as const,
      rules: "Faculty: Selva Agnes",
    },
    {
      name: "Air Crash",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "OPEN" as const,
      rules: "Faculty: Swetha, Harini",
    },
    {
      name: "Photography",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      rules: "Faculty: Supriya",
    },
    {
      name: "Dance Elite",
      category: "DANCE",
      type: "TEAM" as const,
      price: 200,
      minTeamSize: 3,
      maxTeamSize: 10,
      status: "OPEN" as const,
      rules: "Faculty: J Bharathi | Students: Krishnaveni H K, Lahari M, Bhoomika",
    },
    {
      name: "BGMI / Freefire",
      category: "GAMING",
      type: "TEAM" as const,
      price: 200,
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "OPEN" as const,
      rules: "Faculty: Subhrajit Sengupta",
    },
    {
      name: "VVIT got Latent",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      rules: "Faculty: Kavyashree J",
    },
    {
      name: "Reel Video Making",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 4,
      status: "OPEN" as const,
      rules: "Faculty: Sushma B M, Bharathi J",
    },
    {
      name: "The Royal Walk",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      rules: "Faculty: MahaLakshmi",
    },
    {
      name: "Crucial Beats (Singing)",
      category: "THEATRE",
      type: "SOLO" as const,
      price: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      rules: "Faculty: Selva Agnes",
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