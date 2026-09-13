import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { eventId } = await params;
  const userId = auth.session.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, isActive: true, name: true, type: true, status: true, price: true },
  });
  if (!event || !event.isActive) return errorResponse("Event not found or not open.", 404);
  if (event.status !== "OPEN") return errorResponse("Registrations closed for this event.", 400);

  // already registered?
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) return errorResponse("Already registered for this event.", 409);

  // ensure participant exists
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { collegeId: true, collegeName: true } });
  let participant = await prisma.participant.findUnique({ where: { userId } });
  if (!participant) {
    // find college by user's collegeId or fallback to first college
    let collegeId = user?.collegeId;
    if (!collegeId) {
      const college = await prisma.college.findFirst();
      collegeId = college?.id ?? null;
    }
    if (!collegeId) return errorResponse("College not found. Complete your profile first.", 400);
    // generate participantId
    const counter = await prisma.idCounter.upsert({
      where: { entity: "PARTICIPANT" },
      update: { value: { increment: 1 } },
      create: { entity: "PARTICIPANT", value: 1 },
    });
    const participantId = `VTU26-${String(counter.value).padStart(6, "0")}`;
    participant = await prisma.participant.create({
      data: { userId, collegeId, participantId },
    });
  }

  // generate registrationId
  const regCounter = await prisma.idCounter.upsert({
    where: { entity: "REGISTRATION" },
    update: { value: { increment: 1 } },
    create: { entity: "REGISTRATION", value: 1 },
  });
  const registrationId = `REG-${String(regCounter.value).padStart(6, "0")}`;

  const registration = await prisma.registration.create({
    data: {
      registrationId,
      userId,
      eventId,
      collegeId: participant.collegeId,
      status: "PENDING",
      formResponses: {},
    },
  });

  // For paid events, create a PENDING payment so dashboard shows pending until paid
  const price = Number(event.price ?? 0);
  let payment: any = null;
  if (price > 0) {
    payment = await prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: event.price,
        status: "PENDING",
      },
    });
  }

  return successResponse({ registration, payment, isPaidEvent: price > 0, price }, 201);
}
