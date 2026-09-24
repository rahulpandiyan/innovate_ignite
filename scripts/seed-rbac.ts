import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "../lib/rbac-data";
import { avatarUrlFor } from "../lib/avatar";

const prisma = new PrismaClient();

async function nextId(entity: string, prefix: string, pad = 6, tx: any = null): Promise<string> {
  const db = tx ?? prisma;
  const c = await db.idCounter.upsert({
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
      photoUrl: avatarUrlFor(data.email),
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
    { name: "Vijaya Vittala Institute Of Technology", code: "GA-047", region: "Bengaluru" },
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
      name: "TechNinja - Quiz",
      category: "TECHNICAL",
      type: "TEAM" as const,
      price: 50,
      priceMode: "PER_TEAM" as const,
      groupPrice: null,
      minTeamSize: 2,
      maxTeamSize: 2,
      status: "OPEN" as const,
      date: new Date("2026-10-08T10:00:00.000Z"),
      rules: "Team of 2 (no solo) | ₹50 per team | Quiz: 3 rounds (Prelim 25m, Second 25m, Final 25m) | 4 options each | Smartphone required | No AI/search | Top 10 to Second, Top 5 to Final",
      faculty: "M G Kousar",
      students: [{ name: "Sam Goldwin", phone: "+919739431299" }, { name: "Rahul", phone: "+918792137157" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-08T10:00:00.000Z"),
      rules: "Team 2-3 | ₹50 per member | Social service video presentation | Coordinators: Kousar, Rajani | Students: Srishty Singh, Lalitha Sreenivasan",
      faculty: "Kousar, Rajani",
      students: [{ name: "Srishty Singh", phone: "+919741079214" }, { name: "Lalitha Sreenivasan", phone: "+918105398761" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Squad of 4 | ₹200 per team | Offline campus-only squad for BGMI and Free Fire | Prize pool up to ₹5000 | IGL is primary contact | Faculty: Subhrajit Sengupta, Manjunatha | Students: Arshad, Charan",
      faculty: "Subhrajit Sengupta, Manjunatha",
      students: [{ name: "Arshad", phone: "+917795811484" }, { name: "Charan", phone: "+916362348311" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Solo | ₹50 | Talent show | Max 150s | Coordinators: Kavyashree | Students: Shree Khyathi R, M. Harshitha",
      faculty: "Kavyashree",
      students: [{ name: "Shree Khyathi R", phone: "+917975199059" }, { name: "M. Harshitha", phone: "+917975026732" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Team 2-3 (UG only) | ₹50 per team | On-the-spot reel on assigned theme | Max 90s, educational + entertaining | Submit 9:30 AM–3:00 PM to harishhari781823@gmail.com / divyachavala05@gmail.com | Venue: Seminar Hall–2 | No AI tools | Faculty: Sushma BM | Students: Harish 9901709596, Divya C 8792354155",
      faculty: "Sushma BM",
      students: [{ name: "Harish", phone: "919901709596" }, { name: "Divya C", phone: "918792354155" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      faculty: "Bharathi J",
      students: [{ name: "Rachana H T", phone: "916362178152" }, { name: "Sahana", phone: "919141660595" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T09:30:00.000Z"),
      rules: "Individual | ₹50 | Persona-based speaking | Real figures only | Coordinators: Harini, Swetha | Students: Dhikshita A, Harish, LokaPradeep",
      faculty: "Harini, Swetha",
      students: [{ name: "Dhikshita A", phone: "+917892563979" }, { name: "Harish", phone: "+919901709596" }, { name: "LokaPradeep", phone: "+919632425042" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      rules: "Solo | ₹50 | Bring your own camera/phone | Coordinator: Supriya | Students: Dhikshita A, LokaPradeep",
      faculty: "Supriya",
      students: [{ name: "Dhikshita A", phone: "+917892563979" }, { name: "LokaPradeep", phone: "+919632425042" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T10:00:00.000Z"),
      rules: "Solo + Group allowed | Solo ₹50 (max 5 min) | Group 2-12 ₹150 (5-7 min) | Any dance form | Bring the track on a pen drive | Coordinator: J Bharathi | Students: Yashashwini, Krishnaveni, Lahari M",
      faculty: "J Bharathi",
      students: [{ name: "Yashashwini", phone: "+919187621057" }, { name: "Krishnaveni", phone: "+919743116619" }, { name: "Lahari M", phone: "+918884084501" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-08T11:00:00.000Z"),
      rules: "Team 3-4 | ₹200 per team | CS/EC/AI-ML projects | Coordinators: Rashmi, Vanitha | Students: Anushka, Aditya Raj, Sneha",
      faculty: "Rashmi, Vanitha",
      students: [{ name: "Anushka", phone: "+918197197536" }, { name: "Aditya Raj", phone: "+919341606324" }, { name: "Sneha", phone: "+919341435924" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-08T10:00:00.000Z"),
      rules: "Team 1-3 | ₹150 per team | Coding competition | Coordinators: V Vanitha, Rashmi Rani | Students: Anushka, Mohammed Ghouse, Daniel",
      faculty: "V Vanitha, Rashmi Rani",
      students: [{ name: "Anushka", phone: "+918197197536" }, { name: "Mohammed Ghouse", phone: "+917892786089" }, { name: "Daniel", phone: "+919380987187" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      date: new Date("2026-10-09T14:00:00.000Z"),
      rules: "Solo ₹100 / Group ₹150 | Max 4 min | Coordinators: Agnes Stephen | Students: Thannavee, Lavanya",
      faculty: "Agnes Stephen",
      students: [{ name: "Thannavee", phone: "+917204967325" }, { name: "Lavanya", phone: "+917204967325" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
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
      rules: "Team 2-3 | ₹100 per team | Topic at venue | Faculty: Selva Agnes, Supriya P | Students: Thannavee 7204967325, Lavanya 8296876822",
      faculty: "Selva Agnes, Supriya P",
      students: [{ name: "Thannavee", phone: "+917204967325" }, { name: "Lavanya", phone: "+918296876822" }],
      assignCoordinatorId: coordinatorId,
      assignJudgeId: judgeId,
    },
  ];

  // prune stale demo events not in the 10 real events
  const keepNames = events.map(e => e.name);
  await prisma.event.deleteMany({ where: { name: { notIn: keepNames } } });

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
          priceMode: ev.priceMode,
          groupPrice: ev.groupPrice,
          date: ev.date,
          rules: ev.rules,
          minTeamSize: ev.minTeamSize,
          maxTeamSize: ev.maxTeamSize,
          status: ev.status,
          registrationStart: new Date("2026-09-01T00:00:00.000Z"),
          registrationEnd: new Date("2026-10-06T23:59:59.000Z"),
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
    email: "rahul.legend345@gmail.com",
    phone: "+919812341111",
    name: "Rahul",
    collegeName: "Platform Admin",
    password: "Rahul@980",
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

  const soloDance = events.find((e) => e.name === "VVIT GOT LATENT")!;
  const acappella = events.find((e) => e.name === "VV CARE")!;

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
    const reg = await prisma.registration.create({
      data: {
        registrationId: await nextId("REGISTRATION", "REG-"),
        userId: registration.user.id,
        eventId: registration.event.id,
        collegeId: registration.collegeId,
        formResponses: { name: registration.user.id },
        status: registration.status,
      },
    });
    // demo payments removed — finance will see only real submissions
    // (no Payment row created here; created only when user submits via /pay)
    const participantRow = await prisma.participant.findUnique({ where: { userId: registration.user.id } });
    const attendee = await prisma.attendee.create({
      data: {
        registrationId: reg.id,
        participantId: participantRow!.id,
        attendeeId: await nextId("ATTENDEE", "ATT-"),
      },
    });
    await prisma.qRPass.create({
      data: { attendeeId: attendee.id, token: "QR-" + crypto.randomUUID() },
    });
    await prisma.attendance.create({
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
    const bop = events.find((e) => e.name === "BGMI & FreeFire")!;
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
    const bop = events.find((e) => e.name === "BGMI & FreeFire")!;
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
