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
      name: "TechNinja - Quiz",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 50,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 2,
      status: "OPEN" as const,
      date: new Date("2026-10-08T13:30:00+05:30"),
      time: "01:30 PM – 04:30 PM",
      venue: "Ground Floor Labs",
      rules: "Team of 2 (no solo) | ₹50 per team | Quiz: 3 rounds Prelim/Second/Final 25 mins each | 4 options each | Smartphone required | No AI/search | Top 10 to Second, Top 5 to Final",
    },
    {
      name: "VV CARE",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 50,
      priceMode: "PER_PARTICIPANT" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 3,
      status: "OPEN" as const,
      date: new Date("2026-10-08T09:30:00+05:30"),
      time: "09:30 AM – 01:00 PM",
      venue: "Seminar Hall – 1",
      rules: "Team 2-3 | ₹50 per member | Social service / vendor awareness video presentation (max 6 min) | Min 6 teams required | Coordinators: Kousar, Rajani | Students: Srishty Singh, Lalitha Sreenivasan",
    },
    {
      name: "BGMI & FreeFire",
      category: "GAMING",
      type: "TEAM" as const,
      price: 200,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 4,
      maxTeamSize: 4,
      status: "OPEN" as const,
      date: new Date("2026-10-09T09:30:00+05:30"),
      time: "09:30 AM – 04:00 PM",
      venue: "Classrooms",
      rules: "Squad of 4 | ₹200 per team | Offline campus-only, Oct 9 | Prize pool up to ₹5000 | IGL is primary contact | Coordinators: Subhrajit, Kumari Manjunatha | Students: Al Arshad, Charan",
    },
    {
      name: "VVIT GOT LATENT",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 50,
      priceMode: "PER_PARTICIPANT" as const,
      groupPrice: null,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      date: new Date("2026-10-09T09:30:00+05:30"),
      time: "09:30 AM – 01:00 PM",
      venue: "Seminar Hall – 1",
      rules: "Solo | ₹50 | Talent show (singing, dance, comedy, mimicry, magic, poetry, acting, beatboxing, instruments, storytelling) | Max 150s (+60s discretion) | Live performances only | Top 3 places | Coordinators: Kavyashree | Students: Shree Khyathi R, M. Harshitha",
    },
    {
      name: "Reel Video Making",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 50,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 3,
      status: "OPEN" as const,
      date: new Date("2026-10-09T09:30:00+05:30"),
      time: "09:30 AM – 01:30 PM",
      venue: "Seminar Hall – 2",
      rules: "Team 2-3 (UG only) | ₹50 per team | On-the-spot reel on assigned theme | Max 90s, educational + entertaining | Submit 9:30 AM–3:00 PM to harishhari781823@gmail.com / divyachavala05@gmail.com | Venue: Seminar Hall–2 | No AI tools | Faculty: Sushma BM | Students: Harish 9901709596, Divya C 8792354155",
    },
    {
      name: "The Royal Walk",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 50,
      priceMode: "PER_PARTICIPANT" as const,
      groupPrice: null,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      date: new Date("2026-10-09T12:00:00+05:30"),
      time: "12:00 PM – 01:00 PM",
      venue: "Quadrangle",
      rules: "Solo | ₹50 | Fashion/walk event | Faculty: Bharathi J | Students: Rachana H T 6362178152, Sahana 9141660595",
    },
    {
      name: "AIR CRASH",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 50,
      priceMode: "PER_PARTICIPANT" as const,
      groupPrice: null,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      date: new Date("2026-10-09T09:30:00+05:30"),
      time: "09:30 AM – 11:30 AM",
      venue: "Quadrangle",
      rules: "Individual | ₹50 | Persona-based speaking event | Persona must be a real historical/contemporary figure (no fiction/mythology) | Duplicate personas not allowed | English only | Coordinators: Harini, Swetha | Students: Dhikshitha, Harish, Lokicodgameplay",
    },
    {
      name: "PIXELS - Photography",
      category: "GENERAL",
      type: "SOLO" as const,
      price: 50,
      priceMode: "PER_PARTICIPANT" as const,
      groupPrice: null,
      minTeamSize: 1,
      maxTeamSize: 1,
      status: "OPEN" as const,
      date: new Date("2026-10-09T09:30:00+05:30"),
      time: "Open – 09:30 AM",
      venue: "Quadrangle",
      rules: "Solo | ₹50 | Bring your own camera/phone | Coordinator: Supriya",
    },
    {
      name: "DANCE.exe",
      category: "DANCE",
      type: "TEAM" as const,
      price: 50,
      priceMode: "SOLO_OR_GROUP" as const,
      groupPrice: 150,
      minTeamSize: 1,
      maxTeamSize: 12,
      status: "OPEN" as const,
      date: new Date("2026-10-09T14:00:00+05:30"),
      time: "02:00 PM – 04:30 PM",
      venue: "Quadrangle",
      rules: "Solo + Group allowed | Solo ₹50 (max 5 min) | Group 2-12 ₹150 (5-7 min) | Any dance form | Bring the track on a pen drive | Coordinator: J Bharathi | Students: Krishnaveni H K, Lahari M, Bhoomika",
    },
    {
      name: "Mini Project Expo",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 200,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 3,
      maxTeamSize: 4,
      status: "OPEN" as const,
      date: new Date("2026-10-08T13:30:00+05:30"),
      time: "01:30 PM – 04:30 PM",
      venue: "2nd Floor Labs & Classes",
      rules: "Team 3-4 | ₹200 per team | For CS, EC, AI/ML & allied branches | Hardware/software/hybrid projects | Original work only | Coordinators: Rashmi, Vanitha | Students: Anushka, Rajaditya Raj, Sneha",
    },
    {
      name: "Code conflux",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 200,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 2,
      status: "OPEN" as const,
      date: new Date("2026-10-08T09:30:00+05:30"),
      time: "09:30 AM – 01:00 PM",
      venue: "Ground Floor Labs",
      rules: "Team of 2 | 3 rounds Debugging/Coding/Problem Solving | College ID required | No internet/phones unless permitted | Coordinator: V Vanitha, Rashmi Rani",
    },
    {
      name: "Crucial Beats",
      category: "THEATRE",
      type: "TEAM" as const,
      price: 100,
      priceMode: "SOLO_OR_GROUP" as const,
      groupPrice: 150,
      minTeamSize: 1,
      maxTeamSize: 2,
      status: "OPEN" as const,
      date: new Date("2026-10-09T14:00:00+05:30"),
      time: "02:00 PM – 04:30 PM",
      venue: "Seminar Hall – 1",
      rules: "Solo ₹100 / Group ₹150 | One song per participant/team | Max 4 min | Any language & genre | Lip-sync and pre-recorded vocals prohibited | Coordinators: Agnes Stephen | Students: Thannavee, Lavanya",
    },
    {
      name: "Group Discussion",
      category: "GENERAL",
      type: "TEAM" as const,
      price: 100,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 3,
      status: "OPEN" as const,
      date: new Date("2026-10-08T09:30:00+05:30"),
      time: "09:30 AM – 01:00 PM",
      venue: "Placement Cell",
      rules: "Team 2-3 | ₹100 per team | Topic announced at venue | Choose FOR or AGAINST | 5 min prep | Every member must speak | Coordinators: Agnes Stephen | Students: Thannavee, Lavanya",
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
          priceMode: ev.priceMode,
          groupPrice: ev.groupPrice,
          date: (ev as any).date ?? null,
          time: (ev as any).time ?? null,
          venue: (ev as any).venue ?? null,
          rules: ev.rules,
          minTeamSize: ev.minTeamSize,
          maxTeamSize: ev.maxTeamSize,
          status: ev.status,
          registrationStart: new Date("2026-09-01T00:00:00.000Z"),
          registrationEnd: new Date("2026-10-06T23:59:59.000Z"),
          createdById: superAdminId,
        },
      });
      console.log(`event created: ${ev.name}`);
    } else {
      event = await prisma.event.update({
        where: { id: event.id },
        data: {
          price: ev.price,
          priceMode: ev.priceMode,
          groupPrice: ev.groupPrice,
          date: (ev as any).date ?? undefined,
          time: (ev as any).time ?? undefined,
          venue: (ev as any).venue ?? undefined,
          minTeamSize: ev.minTeamSize,
          maxTeamSize: ev.maxTeamSize,
          status: ev.status,
          rules: ev.rules,
          description: ev.rules,
        },
      });
      console.log(`event updated: ${ev.name}`);
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