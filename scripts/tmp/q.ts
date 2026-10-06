import prisma from "../../lib/db";

async function main() {
  const keep = ["bgmi-freefire", "project-expo"];

  const reg = await prisma.registration.findUnique({
    where: { registrationId: "REG-000104" },
    include: { payment: true, event: { select: { slug: true, name: true, price: true } } },
  });
  console.log("REG-000104:", reg ? JSON.stringify({ id: reg.id, status: reg.status, event: reg.event, payment: reg.payment }, null, 2) : "NOT FOUND");

  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true },
    take: 3,
  });
  console.log("SUPER_ADMINs:", JSON.stringify(admins));

  const events = await prisma.event.findMany({
    where: { slug: { notIn: keep } },
    select: { slug: true, price: true, priceMode: true, groupPrice: true, description: true, rules: true },
    orderBy: { slug: "asc" },
  });
  for (const e of events) {
    console.log(`\n=== ${e.slug} | price=${e.price} mode=${e.priceMode} group=${e.groupPrice}`);
    console.log("DESC:", e.description);
    console.log("RULES:", e.rules);
  }

  const pending = await prisma.registration.findMany({
    where: { status: "PENDING", event: { slug: { notIn: keep } } },
    select: { registrationId: true, event: { select: { slug: true, price: true } } },
    orderBy: { registrationId: "asc" },
  });
  console.log("\nPENDING regs on free events:", pending.length);
  for (const p of pending) console.log(" ", p.registrationId, p.event.slug, p.event.price);

  const pays = await prisma.payment.findMany({
    where: { status: { not: "SUCCESS" } },
    select: { status: true, amount: true, registration: { select: { registrationId: true, event: { select: { slug: true } } } } },
  });
  console.log("\nNon-SUCCESS payments:");
  for (const p of pays) console.log(" ", p.registration?.registrationId, p.registration?.event?.slug, p.status, p.amount);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
