import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { issueCertificate, type CertificateTypeName } from "@/lib/certificates";
import { z } from "zod";

const issueSchema = z.object({
  participantId: z.string().min(1),
  eventId: z.string().min(1),
  type: z.enum(["PARTICIPATION", "WINNER", "RUNNER_UP", "SPECIAL_RECOGNITION"]),
  templateId: z.string().optional(),
});

// POST /api/certificates — Issue (or re-issue) a certificate for a participant.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, issueSchema);
    if (parsed.error) return parsed.error;

    const denied = await assertPermission(auth.session.id, "certificates.manage");
    if (denied) return errorResponse(denied, 403);

    const { participantId, eventId, type } = parsed.data;

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: { user: { select: { name: true } } },
    });
    if (!participant) return errorResponse("Participant not found.", 404);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return errorResponse("Event not found.", 404);

    const { certificate, created } = await issueCertificate({
      participantId,
      eventId,
      collegeId: participant.collegeId,
      type: type as CertificateTypeName,
      templateId: parsed.data.templateId ?? null,
      issuedBy: auth.session.id,
    });

    return successResponse(
      {
        certificateId: certificate.certificateId,
        verificationToken: certificate.verificationToken,
        participantName: participant.user.name,
        eventName: event.name,
        type: certificate.type,
        created,
      },
      created ? 201 : 200
    );
  } catch (error) {
    console.error("[POST /api/certificates]", error);
    return errorResponse("Internal server error.", 500);
  }
}