import { NextRequest } from "next/server";
import { requireAdmin, successResponse, errorResponse } from "@/lib/apiHelpers";
import { verifyOrder } from "@/lib/orderVerification";

type RouteContext = { params: Promise<{ orderId: string }> };

// POST /api/admin/orders/:orderId/verify — Verify payment and create registrations
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { orderId } = await context.params;
    await verifyOrder(orderId, auth.session.id);

    return successResponse({
      message: "Payment verified and registrations created.",
    });
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
    console.error("[POST /api/admin/orders/:orderId/verify]", error);
    return errorResponse("Internal server error.", 500);
  }
}