import { NextRequest } from "next/server";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { verifyOrder } from "@/lib/orderVerification";

type RouteContext = { params: Promise<{ orderId: string }> };

// POST /api/payments/[orderId]/verify — Finance confirms a submitted payment.
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const denied = await assertPermission(auth.session.id, "payments.verify");
    if (denied) return errorResponse(denied, 403);

    const { orderId } = await context.params;
    await verifyOrder(orderId, auth.session.id);

    return successResponse({ message: "Payment verified and registrations created." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ORDER_NOT_FOUND") {
      return errorResponse("Order not found.", 404);
    }
    if (message.startsWith("ORDER_NOT_VERIFIABLE")) {
      return errorResponse(
        `Order cannot be verified. Current status: ${message.split(":")[1] ?? "unknown"}.`,
        400
      );
    }
    console.error("[POST /api/payments/:orderId/verify]", error);
    return errorResponse("Internal server error.", 500);
  }
}