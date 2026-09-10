import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { getCollegeIdForUser } from "@/lib/collegeAdmin";
import { z } from "zod";

type RouteContext = { params: Promise<{ attendeeId: string }> };

const schema = z.object({
  status: z.enum(["VERIFIED", "INELIGIBLE"]),
});

// POST /api/college-admin/attendee/:attendeeId/eligibility
// College admin verifies or flags one of their college's attendees.
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const role = auth.session.role;
    const isSuper = role === "SUPER_ADMIN";
    if (!isSuper && role !== "COLLEGE_ADMIN") {
      return errorResponse("Forbidden.", 403);
    }

    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;

    const { attendeeId } = await context.params;

    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
      include: {
        registration: { select: { collegeId: true } },
      },
    });
    if (!attendee) return errorResponse("Attendee not found.", 404);

    if (!isSuper) {
      const collegeId =
        auth.session.collegeId ?? (await getCollegeIdForUser(auth.session.id));
      if (!collegeId || attendee.registration.collegeId !== collegeId) {
        return errorResponse("You can only verify attendees from your college.", 403);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.attendee.update({
        where: { id: attendeeId },
        data: { status: parsed.data.status },
      });
      await tx.auditLog.create({
        data: {
          userId: auth.session.id,
          action: "REGISTRATION_UPDATED",
          entityType: "Attendee",
          entityId: attendeeId,
          details: {
            status: parsed.data.status,
            collegeId: attendee.registration.collegeId,
          },
        },
      });
    });

    return successResponse({ attendeeId, status: parsed.data.status });
  } catch (error) {
    console.error("[POST /api/college-admin/attendee/:id/eligibility]", error);
    return errorResponse("Internal server error.", 500);
  }
}