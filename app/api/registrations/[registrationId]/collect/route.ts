import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";

export async function POST(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const denied = await assertPermission(auth.session.id, "payments.collect");
  if (denied) return errorResponse(denied, 403);

  const { registrationId } = await params;
  const body = await req.json().catch(() => ({}));
  const { transactionId, notes } = body as { transactionId?: string; notes?: string };

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true },
  });
  if (!registration) return errorResponse("Registration not found.", 404);
  if (!registration.payment) return errorResponse("No payment record for this registration.", 400);
  if (registration.payment.status !== "PENDING") return errorResponse(`Payment already ${registration.payment.status.toLowerCase()}.`, 400);

  // Verify coordinator is assigned to this event
  const coordinator = await prisma.eventCoordinator.findFirst({
    where: { userId: auth.session.id, eventId: registration.eventId },
  });
  if (!coordinator && auth.session.role !== "SUPER_ADMIN") {
    return errorResponse("You are not a coordinator for this event.", 403);
  }

  await prisma.payment.update({
    where: { registrationId: registration.id },
    data: {
      status: "COORDINATOR_COLLECTED",
      collectedAt: new Date(),
      collectedBy: auth.session.id,
      transactionId: transactionId || notes || "Collected by coordinator",
    },
  });

  return successResponse({ message: "Payment marked as collected. Awaiting finance verification." });
}
