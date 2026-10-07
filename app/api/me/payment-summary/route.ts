import { requireAuth, successResponse } from "@/lib/apiHelpers";
import prisma from "@/lib/db";
import { displayEventName } from "@/lib/eventDisplay";

export const dynamic = "force-dynamic";

// Payment statuses where the money is already with us and only verification
// is outstanding. Anything else on a paid event still needs the student to act.
const IN_REVIEW_STATUSES = ["PROCESSING", "COORDINATOR_COLLECTED"];

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const userId = auth.session.id;

  const [registrations, orders] = await Promise.all([
    prisma.registration.findMany({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        event: { price: { gt: 0 } },
        OR: [{ payment: null }, { payment: { status: { not: "SUCCESS" } } }],
      },
      select: {
        id: true,
        formResponses: true,
        event: { select: { name: true, price: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        orderItems: { select: { event: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const unpaidEvents: { label: string; amount: number; registrationId: string }[] = [];
  const reviewEvents: { label: string; amount: number; registrationId: string }[] = [];

  for (const reg of registrations) {
    const status = reg.payment?.status ?? null;
    const amount = Number(reg.event.price);
    const item = {
      label: displayEventName(reg.event.name, reg.formResponses),
      amount,
      registrationId: reg.id,
    };

    if (status === null) {
      unpaidEvents.push(item);
      continue;
    }
    if (IN_REVIEW_STATUSES.includes(status)) {
      reviewEvents.push(item);
      continue;
    }
    // PENDING / FAILED / CANCELLED all mean the student still owes money.
    unpaidEvents.push(item);
  }

  const unpaidOrderEvents: { label: string; amount: number; orderId: string }[] = [];
  const reviewOrderEvents: { label: string; amount: number; orderId: string }[] = [];

  for (const order of orders) {
    if (order.status === "VERIFIED" || order.status === "REJECTED") continue;
    const labels = order.orderItems.map((i) => i.event.name);
    const item = {
      label: labels.join(", ") || "Event registration",
      amount: Number(order.totalAmount),
      orderId: order.id,
    };
    if (order.status === "PAYMENT_SUBMITTED") reviewOrderEvents.push(item);
    else unpaidOrderEvents.push(item);
  }

  return successResponse({
    unpaidCount: unpaidEvents.length + unpaidOrderEvents.length,
    reviewCount: reviewEvents.length + reviewOrderEvents.length,
    unpaidEvents,
    reviewEvents,
    unpaidOrderEvents,
    reviewOrderEvents,
    totalDue:
      unpaidEvents.reduce((s, e) => s + e.amount, 0) +
      unpaidOrderEvents.reduce((s, e) => s + e.amount, 0),
  });
}