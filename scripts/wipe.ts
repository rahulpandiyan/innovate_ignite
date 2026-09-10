import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABLES_IN_ORDER = [
  "attendance",
  "judgeScore",
  "certificate",
  "result",
  "announcement",
  "notification",
  "payment",
  "attendee",
  "registration",
  "qRPass",
  "registrationField",
  "registrationForm",
  "eventCoordinator",
  "judge",
  "teamMember",
  "teamInvite",
  "team",
  "cartItem",
  "orderItem",
  "order",
  "idCounter",
  "event",
] as const;

async function main() {
  for (const t of TABLES_IN_ORDER) {
    const res = await (prisma as unknown as Record<string, { deleteMany: () => Promise<{ count: number }> }>)[t as string].deleteMany();
    console.log(`${t}: deleted ${res.count}`);
  }
  // close the id counters
  console.log("wipe done");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });