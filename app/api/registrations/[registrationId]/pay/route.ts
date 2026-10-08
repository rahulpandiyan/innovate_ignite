import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { registrationDueAmount } from "@/lib/pricing";
import { z } from "zod";

const paySchema = z
  .object({
    paymentMethod: z.enum(["upi", "offline"]).default("upi"),
    upiTransactionId: z.string().optional(),
    paymentScreenshotUrl: z.string().optional(),
  })
  .refine(
    (d) => d.paymentMethod !== "upi" || (d.upiTransactionId && d.upiTransactionId.length > 0),
    { message: "UPI transaction ID is required for UPI payments" }
  )
  .refine(
    (d) => d.paymentMethod !== "upi" || (d.paymentScreenshotUrl && d.paymentScreenshotUrl.length > 0),
    { message: "Screenshot is required for UPI payments" }
  );

export async function POST(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { registrationId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = paySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  const { upiTransactionId, paymentScreenshotUrl, paymentMethod } = parsed.data;

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      payment: true,
      event: { select: { price: true, priceMode: true, groupPrice: true, minTeamSize: true } },
    },
  });
  if (!registration) return errorResponse("Registration not found.", 404);
  if (registration.userId !== auth.session.id) return errorResponse("Forbidden.", 403);
  // Confirmed registrations can still pay when they were confirmed without a
  // successful payment (e.g. registered while the event was free).
  if (registration.status === "CONFIRMED" && registration.payment?.status === "SUCCESS") {
    return errorResponse("Already confirmed.", 400);
  }

  // Group / per-member dues must not fall back to the base event price.
  const price = registrationDueAmount(registration.event, registration.formResponses);
  if (price <= 0) return errorResponse("This event is free.", 400);

  // If payment already exists and is not PENDING, block resubmit
  if (registration.payment && registration.payment.status !== "PENDING") {
    return errorResponse(`Payment already ${registration.payment.status.toLowerCase()}.`, 400);
  }

  const isOffline = paymentMethod === "offline";

  if (registration.payment) {
    await prisma.payment.update({
      where: { registrationId: registration.id },
      data: {
        amount: price,
        transactionId: isOffline ? "OFFLINE" : upiTransactionId,
        receiptUrl: isOffline ? null : paymentScreenshotUrl,
        gatewayRef: isOffline ? "OFFLINE" : paymentScreenshotUrl,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: price,
        status: "PENDING",
        transactionId: isOffline ? "OFFLINE" : upiTransactionId,
        receiptUrl: isOffline ? null : paymentScreenshotUrl,
        gatewayRef: isOffline ? "OFFLINE" : paymentScreenshotUrl,
      },
    });
  }

  // Do NOT auto-confirm. Finance must verify via admin.
  // Optionally we could mark payment as PROCESSING, but keep PENDING for now.

  return successResponse({ message: "Payment submitted for verification. Registration will confirm after finance verification." });
}
