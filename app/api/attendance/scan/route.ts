import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission, getEventScope } from "@/lib/rbac";
import { z } from "zod";

const scanSchema = z.object({
  token: z.string().min(4, "Invalid QR token"),
});

// POST /api/attendance/scan — Check-in/out an attendee by QR pass token
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, scanSchema);
    if (parsed.error) return parsed.error;

    const { token } = parsed.data;

    const pass = await prisma.qRPass.findUnique({
      where: { token },
      include: {
        attendee: {
          include: {
            registration: {
              include: {
                event: { select: { id: true, name: true } },
                user: { select: { name: true, email: true, collegeName: true } },
              },
            },
          },
        },
      },
    });

    if (!pass?.attendee) {
      return errorResponse("QR pass not found or invalid.", 404);
    }

    const registration = pass.attendee.registration;

    // Scope check: attendance staff are venue-wide; coordinators/admins scoped
    const scope = await getEventScope(auth.session.id);
    if (auth.session.role !== "ATTENDANCE_STAFF") {
      const allowed = scope === null || scope.includes(registration.event.id);
      if (!allowed) {
        return errorResponse("This attendee is outside your assigned scope.", 403);
      }
    }

    const deniedPermission = await assertPermission(auth.session.id, "attendance.manage");
    if (deniedPermission) {
      return errorResponse(deniedPermission, 403);
    }

    if (registration.status !== "CONFIRMED") {
      return errorResponse(
        `Registration ${registration.registrationId} is ${registration.status}. Cannot check in.`,
        409
      );
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: {
          attendeeId_eventId: {
            attendeeId: pass.attendee.id,
            eventId: registration.event.id,
          },
        },
      });

      const checkingIn = !existing || existing.status !== "CHECKED_IN";

      const attendance = await tx.attendance.upsert({
        where: {
          attendeeId_eventId: {
            attendeeId: pass.attendee.id,
            eventId: registration.event.id,
          },
        },
        update: {
          status: checkingIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
          checkedInAt: checkingIn ? now : null,
          checkedBy: auth.session.id,
        },
        create: {
          attendeeId: pass.attendee.id,
          eventId: registration.event.id,
          registrationId: registration.id,
          status: "CHECKED_IN",
          checkedInAt: now,
          checkedBy: auth.session.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.session.id,
          action: checkingIn ? "ATTENDANCE_CHECKED_IN" : "ATTENDANCE_CORRECTED",
          entityType: "Attendance",
          entityId: attendance.id,
          details: {
            attendeeId: pass.attendee.attendeeId,
            eventId: registration.event.id,
            token: token.slice(0, 16),
          },
        },
      });

      return { attendance, checkingIn };
    });

    return successResponse({
      checkIn: result.checkingIn,
      checkedInAt: result.checkingIn ? now.toISOString() : null,
      attendee: {
        attendeeId: pass.attendee.attendeeId,
        name: registration.user.name,
        email: registration.user.email,
        college: registration.user.collegeName,
        eventName: registration.event.name,
        registrationId: registration.registrationId,
      },
    });
  } catch (error) {
    console.error("[POST /api/attendance/scan]", error);
    return errorResponse("Internal server error.", 500);
  }
}