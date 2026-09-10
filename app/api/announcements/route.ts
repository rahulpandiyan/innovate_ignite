import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertEventScope } from "@/lib/rbac";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  eventId: z.string().uuid("Invalid event ID"),
});

// POST /api/announcements — Coordinator/Admin scoped-to-event announcement
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, createAnnouncementSchema);
    if (parsed.error) return parsed.error;

    const { title, body, eventId } = parsed.data;

    const denied = await assertEventScope(auth.session.id, "announcements.write", eventId);
    if (denied) return errorResponse(denied, 403);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    });
    if (!event) return errorResponse("Event not found.", 404);

    const result = await prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          title,
          body,
          createdById: auth.session.id,
          target: "EVENT",
          targetIds: [eventId],
          publishedAt: new Date(),
        },
      });

      const registeredUsers = await tx.registration.findMany({
        where: { eventId, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { userId: true },
      });
      const userIds = [...new Set(registeredUsers.map((r) => r.userId))];

      await tx.notification.createMany({
        data: userIds.map((uid) => ({
          userId: uid,
          announcementId: announcement.id,
          title,
          message: body,
          type: "EVENT",
        })),
      });

      return announcement;
    });

    return successResponse({ announcement: result }, 201);
  } catch (error) {
    console.error("[POST /api/announcements]", error);
    return errorResponse("Internal server error.", 500);
  }
}