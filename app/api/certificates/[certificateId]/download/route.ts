import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, errorResponse } from "@/lib/apiHelpers";
import { assertPermission } from "@/lib/rbac";
import { generateCertificatePdf, humanizeType } from "@/lib/certificates";

// GET /api/certificates/[certificateId]/download — Certificate PDF (gated by certificates.download).
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ certificateId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const denied = await assertPermission(auth.session.id, "certificates.download");
    if (denied) return errorResponse(denied, 403);

    const { certificateId } = await ctx.params;

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        participant: { include: { user: { select: { name: true } } } },
        college: { select: { name: true } },
        event: { select: { name: true } },
      },
    });
    if (!certificate) return errorResponse("Certificate not found.", 404);

    const pdf = await generateCertificatePdf({
      name: certificate.participant.user.name,
      eventName: certificate.event.name,
      collegeName: certificate.college.name,
      certificateId: certificate.certificateId,
      verificationToken: certificate.verificationToken,
      type: certificate.type,
      issuedAt: certificate.issuedAt,
    });

    const filename = `${certificate.certificateId}-${humanizeType(certificate.type)}.pdf`;
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/certificates/download]", error);
    return errorResponse("Internal server error.", 500);
  }
}