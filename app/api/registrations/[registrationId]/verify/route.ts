import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const denied = await assertPermission(auth.session.id, "payments.verify");
  if (denied) return errorResponse(denied, 403);

  const { registrationId } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true, event: { select: { price: true } } },
  });
  if (!registration) return errorResponse("Registration not found.", 404);
  if (!registration.payment) return errorResponse("No payment to verify.", 400);
  if (registration.payment.status !== "PENDING") return errorResponse(`Payment already ${registration.payment.status.toLowerCase()}.`, 400);

  await prisma.payment.update({
    where: { registrationId: registration.id },
    data: { status: "SUCCESS", confirmedAt: new Date(), verifiedBy: auth.session.id },
  });
  await prisma.registration.update({ where: { id: registration.id }, data: { status: "CONFIRMED" } });

  // create attendee + QR if missing
  let participant = await prisma.participant.findUnique({ where: { userId: registration.userId } });
  if (!participant) {
    const counter = await prisma.idCounter.upsert({
      where: { entity: "PARTICIPANT" },
      update: { value: { increment: 1 } },
      create: { entity: "PARTICIPANT", value: 1 },
    });
    const user = await prisma.user.findUnique({ where: { id: registration.userId }, select: { collegeId: true } });
    const college = user?.collegeId ? await prisma.college.findUnique({ where: { id: user.collegeId } }) : await prisma.college.findFirst();
    if (college) {
      participant = await prisma.participant.create({
        data: { userId: registration.userId, collegeId: college.id, participantId: `VTU26-${String(counter.value).padStart(6, "0")}` },
      });
    }
  }
  if (participant) {
    const existing = await prisma.attendee.findFirst({ where: { registrationId: registration.id } });
    if (!existing) {
      const attCounter = await prisma.idCounter.upsert({
        where: { entity: "ATTENDEE" },
        update: { value: { increment: 1 } },
        create: { entity: "ATTENDEE", value: 1 },
      });
      const attendee = await prisma.attendee.create({
        data: { registrationId: registration.id, participantId: participant.id, attendeeId: `ATT-${String(attCounter.value).padStart(6, "0")}` },
      });
      await prisma.qRPass.create({ data: { attendeeId: attendee.id, token: randomUUID() } });
      await prisma.attendance.create({ data: { attendeeId: attendee.id, eventId: registration.eventId, registrationId: registration.id, status: "NOT_CHECKED_IN" } });
    }
  }

  return successResponse({ message: "Payment verified, registration confirmed." });
}
