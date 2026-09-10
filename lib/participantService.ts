import "server-only";
import prisma from "@/lib/db";
import { nextPublicId } from "@/lib/ids";
import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

async function resolveCollegeId(
  collegeId: string | null | undefined,
  collegeName: string | null | undefined,
  tx?: Tx
): Promise<string> {
  const db = tx ?? prisma;
  if (collegeId) return collegeId;
  if (collegeName && collegeName.trim()) {
    const existing = await db.college.findFirst({
      where: { name: collegeName },
    });
    if (existing) return existing.id;
    return db.college.create({
      data: {
        name: collegeName,
        code: `AUTO-${randomUUID().slice(0, 8).toUpperCase()}`,
        region: "Auto-created",
      },
    }).then((c) => c.id);
  }
  throw new Error(`Cannot resolve a college for participant creation.`);
}

/**
 * Returns the Participant row for a user, creating one (with a VTU26- id) if
 * it does not exist yet. Uses a transaction client when provided.
 */
export async function ensureParticipant(
  userId: string,
  collegeId: string | null | undefined,
  collegeName: string | null | undefined,
  tx?: Tx
) {
  const db = tx ?? prisma;
  const existing = await db.participant.findUnique({ where: { userId } });
  if (existing) return existing;
  const resolvedCollegeId = await resolveCollegeId(collegeId, collegeName, tx);
  return db.participant.create({
    data: {
      userId,
      collegeId: resolvedCollegeId,
      participantId: await nextPublicId("PARTICIPANT", "VTU26-"),
    },
  });
}

/**
 * Ensures a Registration has an Attendee row and a stable QR pass token.
 * Idempotent — safe to call repeatedly for the same registration.
 */
export async function ensureAttendeeAndQR(
  registrationId: string,
  tx?: Tx
): Promise<{ attendeeId: string; qrToken: string }> {
  const db = tx ?? prisma;
  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { user: { select: { collegeId: true, collegeName: true } } },
  });
  if (!reg) throw new Error("Registration not found.");

  const participant = await ensureParticipant(
    reg.userId,
    reg.collegeId ?? reg.user.collegeId,
    reg.user.collegeName,
    tx
  );

  const attendee = await db.attendee.upsert({
    where: {
      registrationId_participantId: {
        registrationId: reg.id,
        participantId: participant.id,
      },
    },
    update: {},
    create: {
      registrationId: reg.id,
      participantId: participant.id,
      attendeeId: await nextPublicId("ATTENDEE", "ATT-"),
    },
  });

  const qr = await db.qRPass.upsert({
    where: { attendeeId: attendee.id },
    update: {},
    create: {
      attendeeId: attendee.id,
      token: `QR-${randomUUID()}`,
    },
  });

  return { attendeeId: attendee.id, qrToken: qr.token };
}