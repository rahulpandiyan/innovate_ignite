import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { z } from "zod";

const paySchema = z.object({
  upiTransactionId: z.string().min(1, "UPI transaction ID is required"),
  paymentScreenshotUrl: z.string().url("A valid screenshot URL is required"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { registrationId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = paySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  const { upiTransactionId, paymentScreenshotUrl } = parsed.data;

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true, event: { select: { price: true } } },
  });
  if (!registration) return errorResponse("Registration not found.", 404);
  if (registration.userId !== auth.session.id) return errorResponse("Forbidden.", 403);
  if (registration.status === "CONFIRMED") return errorResponse("Already confirmed.", 400);

  const price = Number(registration.event.price ?? 0);
  if (price <= 0) return errorResponse("This event is free.", 400);

  // If payment already exists and is not PENDING, block resubmit
  if (registration.payment && registration.payment.status !== "PENDING") {
    return errorResponse(`Payment already ${registration.payment.status.toLowerCase()}.`, 400);
  }

  // Store UPI + screenshot and keep payment as PENDING for finance to verify
  // We keep PENDING but attach transaction details; registration stays PENDING
  if (registration.payment) {
    await prisma.payment.update({
      where: { registrationId: registration.id },
      data: {
        transactionId: upiTransactionId,
        receiptUrl: paymentScreenshotUrl,
        // keep PENDING, set gatewayRef for audit
        gatewayRef: paymentScreenshotUrl,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: registration.event.price,
        status: "PENDING",
        transactionId: upiTransactionId,
        receiptUrl: paymentScreenshotUrl,
        gatewayRef: paymentScreenshotUrl,
      },
    });
  }

  // Do NOT auto-confirm. Finance must verify via admin.
  // Optionally we could mark payment as PROCESSING, but keep PENDING for now.

  return successResponse({ message: "Payment submitted for verification. Registration will confirm after finance verification." });
}
