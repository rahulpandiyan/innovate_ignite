import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { nextPublicId } from "@/lib/ids";
import { ensureAttendeeAndQR } from "@/lib/participantService";

/**
 * Verify a PAYMENT_SUBMITTED order: mark it verified and create CONFIRMED
 * registrations (with attendees, QR passes and SUCCESS payments) for every
 * order item. Shared by the legacy admin route and the finance workspace.
 */
export async function verifyOrder(orderId: string, actorId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          Team: {
            include: {
              members: { select: { userId: true } },
              college: { select: { id: true } },
            },
          },
        },
      },
      user: { select: { collegeId: true } },
    },
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.status !== "PAYMENT_SUBMITTED") {
    throw new Error(`ORDER_NOT_VERIFIABLE:${order.status}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: actorId,
      },
    });

    for (const item of order.orderItems) {
      if (item.Team && item.Team.members.length > 0) {
        for (const member of item.Team.members) {
          await createConfirmedRegistration(tx, {
            key: { userId: member.userId, eventId: item.eventId },
            data: {
              teamId: item.teamId,
              collegeId: item.Team.college?.id ?? order.user.collegeId,
            },
            payment: {
              amount: Number(item.price),
              transactionId: order.upiTransactionId,
              receiptUrl: order.paymentScreenshotUrl,
            },
            actorId,
          });
        }
      } else {
        await createConfirmedRegistration(tx, {
          key: { userId: order.userId, eventId: item.eventId },
          data: {
            teamId: null,
            collegeId: order.user.collegeId,
          },
          payment: {
            amount: Number(item.price),
            transactionId: order.upiTransactionId,
            receiptUrl: order.paymentScreenshotUrl,
          },
          actorId,
        });
      }
    }

    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: "PAYMENT_VERIFIED",
        entityType: "Order",
        entityId: orderId,
        details: {
          orderUserId: order.userId,
          totalAmount: order.totalAmount.toString(),
          itemCount: order.orderItems.length,
        },
      },
    });
  });
}

type Tx = Prisma.TransactionClient;

async function createConfirmedRegistration(
  tx: Tx,
  args: {
    key: { userId: string; eventId: string };
    data: { teamId: string | null; collegeId: string | null };
    payment: { amount: number; transactionId: string | null; receiptUrl: string | null };
    actorId: string;
  }
) {
  const existing = await tx.registration.findUnique({
    where: { userId_eventId: args.key },
  });
  const reg = await tx.registration.upsert({
    where: { userId_eventId: args.key },
    create: {
      registrationId: existing?.registrationId ?? (await nextPublicId("REGISTRATION", "REG-")),
      userId: args.key.userId,
      eventId: args.key.eventId,
      teamId: args.data.teamId,
      collegeId: args.data.collegeId,
      status: "CONFIRMED",
    },
    update: {},
  });
  await ensureAttendeeAndQR(reg.id, tx);
  await tx.payment.upsert({
    where: { registrationId: reg.id },
    update: {},
    create: {
      registrationId: reg.id,
      amount: args.payment.amount,
      status: "SUCCESS",
      transactionId: args.payment.transactionId,
      receiptUrl: args.payment.receiptUrl,
      confirmedAt: new Date(),
      verifiedBy: args.actorId,
    },
  });
  return reg;
}