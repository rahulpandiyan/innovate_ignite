import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { sendPaymentReminderEmail } from "@/lib/email";
import { displayEventName } from "@/lib/eventDisplay";
import { registrationDueAmount } from "@/lib/pricing";

// POST /api/registrations/:registrationId/remind — Finance nudges a
// registered-but-unpaid participant by mail to pay and book the slot.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const deniedFinance = await assertPermission(auth.session.id, "payments.verify");
  const deniedCollect = await assertPermission(auth.session.id, "payments.collect");
  if (deniedFinance && deniedCollect) {
    return errorResponse("Forbidden.", 403);
  }

  const { registrationId } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { name: true, price: true, priceMode: true, groupPrice: true, minTeamSize: true } },
      payment: { select: { status: true, amount: true, transactionId: true } },
    },
  });
  if (!registration) return errorResponse("Registration not found.", 404);
  if (registration.status !== "PENDING") {
    return errorResponse(`Registration is already ${registration.status.toLowerCase()}.`, 400);
  }
  if (
    registration.payment &&
    registration.payment.transactionId &&
    (registration.payment.status === "PENDING" || registration.payment.status === "COORDINATOR_COLLECTED")
  ) {
    return errorResponse("Payment already submitted — verify it instead of reminding.", 400);
  }

  const amount = registrationDueAmount(registration.event, registration.formResponses);

  let mailId = "";
  try {
    const sent = await sendPaymentReminderEmail({
      to: registration.user.email,
      name: registration.user.name,
      eventName: displayEventName(registration.event.name, registration.formResponses),
      amount,
      registrationId: registration.registrationId,
      payId: registration.id,
    });
    mailId = sent.id;
  } catch (err) {
    console.error("[remind] mail failed:", err);
    return errorResponse("Could not send reminder mail. Try again.", 502);
  }

  return successResponse({ message: `Reminder sent to ${registration.user.email}.`, mailId });
}
