import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";

export async function POST(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const denied = await assertPermission(auth.session.id, "payments.manage");
  if (denied) return errorResponse(denied, 403);

  const { registrationId } = await params;
  const body = await req.json().catch(() => ({}));
  const { reason } = body as { reason?: string };

  if (!reason || !reason.trim()) return errorResponse("Rejection reason is required.", 400);

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true },
  });
  if (!registration) return errorResponse("Registration not found.", 404);

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      status: "REJECTED",
      rejectionReason: reason.trim(),
      rejectedAt: new Date(),
      rejectedBy: auth.session.id,
    },
  });

  // Update payment status if exists
  if (registration.payment) {
    await prisma.payment.update({
      where: { registrationId: registration.id },
      data: { status: "FAILED" },
    });
  }

  return successResponse({ message: "Registration rejected." });
}
