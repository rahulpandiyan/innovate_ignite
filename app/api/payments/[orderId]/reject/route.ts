import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { z } from "zod";

type RouteContext = { params: Promise<{ orderId: string }> };

const rejectSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required"),
});

// POST /api/payments/[orderId]/reject — Finance rejects a submitted payment.
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const denied = await assertPermission(auth.session.id, "payments.manage");
    if (denied) return errorResponse(denied, 403);

    const { orderId } = await context.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse("Order not found.", 404);
    if (order.status !== "PAYMENT_SUBMITTED") {
      return errorResponse(
        `Order cannot be rejected. Current status: ${order.status}.`,
        400
      );
    }

    const parsed = await parseBody(req, rejectSchema);
    if (parsed.error) return parsed.error;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "REJECTED", rejectionReason: parsed.data.reason },
      });
      await tx.auditLog.create({
        data: {
          userId: auth.session.id,
          action: "PAYMENT_REJECTED",
          entityType: "Order",
          entityId: orderId,
          details: { reason: parsed.data.reason, totalAmount: order.totalAmount.toString() },
        },
      });
    });

    return successResponse({ message: "Payment submission rejected." });
  } catch (error) {
    console.error("[POST /api/payments/:orderId/reject]", error);
    return errorResponse("Internal server error.", 500);
  }
}