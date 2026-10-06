import prisma from "../../lib/db";
import { randomUUID } from "crypto";

const KEEP = ["bgmi-freefire", "project-expo"];

function stripFees(text: string): string {
  return text
    .replace(/Solo ₹\d+ \/ Group ₹\d+/g, "Free")
    .replace(/Solo ₹\d+ \(max 5 min\)/g, "Solo (max 5 min)")
    .replace(/Group 2-10 ₹\d+ \(5-7 min\)/g, "Group 2-10 (5-7 min)")
    .replace(/₹\d+ per (team|member|participant|head)/g, "Free")
    .replace(/₹\d+/g, "Free");
}

async function ensureAttendeeQRAttendance(registrationId: string) {
  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { user: { select: { collegeId: true, collegeName: true } } },
  });
  if (!reg) throw new Error(`Registration ${registrationId} not found.`);

  let participant = await prisma.participant.findUnique({ where: { userId: reg.userId } });
  if (!participant) {
    const counter = await prisma.idCounter.upsert({
      where: { entity: "PARTICIPANT" },
      update: { value: { increment: 1 } },
      create: { entity: "PARTICIPANT", value: 1 },
    });
    const user = await prisma.user.findUnique({ where: { id: reg.userId }, select: { collegeId: true } });
    const college = user?.collegeId
      ? await prisma.college.findUnique({ where: { id: user.collegeId } })
      : await prisma.college.findFirst();
    if (!college) throw new Error(`No college for user ${reg.userId}`);
    participant = await prisma.participant.create({
      data: {
        userId: reg.userId,
        collegeId: college.id,
        participantId: `VTU26-${String(counter.value).padStart(6, "0")}`,
      },
    });
  }

  const attendee = await prisma.attendee.upsert({
    where: { registrationId_participantId: { registrationId: reg.id, participantId: participant.id } },
    update: {},
    create: {
      registrationId: reg.id,
      participantId: participant.id,
      attendeeId: await (async () => {
        const c = await prisma.idCounter.upsert({
          where: { entity: "ATTENDEE" },
          update: { value: { increment: 1 } },
          create: { entity: "ATTENDEE", value: 1 },
        });
        return `ATT-${String(c.value).padStart(6, "0")}`;
      })(),
    },
  });

  const qr = await prisma.qRPass.upsert({
    where: { attendeeId: attendee.id },
    update: {},
    create: { attendeeId: attendee.id, token: `QR-${randomUUID()}` },
  });

  const att = await prisma.attendance.findFirst({ where: { attendeeId: attendee.id } });
  if (!att) {
    await prisma.attendance.create({
      data: { attendeeId: attendee.id, eventId: reg.eventId, registrationId: reg.id, status: "NOT_CHECKED_IN" },
    });
  }
  return qr.token;
}

async function main() {
  // 1. Verify the one stuck TechNinja payment (REG-000104) — no email.
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) throw new Error("No SUPER_ADMIN found to attribute verification to.");
  const stuck = await prisma.registration.findUnique({
    where: { registrationId: "REG-000104" },
    include: { payment: true },
  });
  if (!stuck) throw new Error("REG-000104 not found.");
  if (stuck.payment && stuck.payment.status !== "SUCCESS") {
    await prisma.payment.update({
      where: { registrationId: stuck.id },
      data: { status: "SUCCESS", confirmedAt: new Date(), verifiedBy: admin.id },
    });
    console.log(`[1] payment REG-000104: PENDING -> SUCCESS (verifiedBy ${admin.email})`);
  } else {
    console.log(`[1] payment REG-000104 already ${stuck.payment?.status ?? "none"} — skipped`);
  }

  // 2. Zero prices everywhere except BGMI & FreeFire + Project Expo.
  const zeroed = await prisma.event.updateMany({
    where: { slug: { notIn: KEEP } },
    data: { price: 0, groupPrice: null },
  });
  console.log(`[2] events zeroed: ${zeroed.count}`);

  // 3. Strip fee text from description/rules of now-free events.
  const freeEvents = await prisma.event.findMany({
    where: { slug: { notIn: KEEP } },
    select: { id: true, slug: true, description: true, rules: true },
  });
  for (const e of freeEvents) {
    const slugSafe = e.slug ?? e.id;
    const description = e.description ? stripFees(e.description) : e.description;
    const rules = e.rules ? stripFees(e.rules) : e.rules;
    const changes: string[] = [];
    if (description !== e.description) changes.push("description");
    if (rules !== e.rules) changes.push("rules");
    if (description?.includes("₹") || rules?.includes("₹")) throw new Error(`₹ left in ${slugSafe}`);
    if (changes.length) {
      await prisma.event.update({ where: { id: e.id }, data: { description, rules } });
      console.log(`[3] ${slugSafe}: stripped fee text from ${changes.join(" + ")}`);
    } else {
      console.log(`[3] ${slugSafe}: no fee text`);
    }
  }

  // 4. Confirm every PENDING registration on a now-free event (+ QR pass), no email.
  const pending = await prisma.registration.findMany({
    where: { status: "PENDING", event: { slug: { notIn: KEEP } } },
    select: { id: true, registrationId: true, event: { select: { slug: true } } },
    orderBy: { registrationId: "asc" },
  });
  for (const p of pending) {
    await prisma.registration.update({ where: { id: p.id }, data: { status: "CONFIRMED" } });
    const token = await ensureAttendeeQRAttendance(p.id);
    console.log(`[4] ${p.registrationId} (${p.event.slug}): PENDING -> CONFIRMED, qr=${token.slice(0, 12)}...`);
  }
  console.log(`[4] total backfilled: ${pending.length}`);

  // Final state.
  const after = await prisma.event.findMany({
    select: { slug: true, price: true, groupPrice: true },
    orderBy: { slug: "asc" },
  });
  console.log("\nEvent prices after:");
  for (const e of after) console.log(`  ${(e.slug ?? "").padEnd(22)} price=${e.price} group=${e.groupPrice}`);

  const counts = await prisma.registration.groupBy({
    by: ["status"],
    where: { event: { slug: { notIn: KEEP } } },
    _count: true,
  });
  console.log("\nReg statuses on free events:", JSON.stringify(counts));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
