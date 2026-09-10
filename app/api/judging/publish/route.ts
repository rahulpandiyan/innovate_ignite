import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission, assertEventScope } from "@/lib/rbac";
import { getEventStandings } from "@/lib/judging";
import { z } from "zod";

const publishSchema = z.object({
  eventId: z.string().min(1),
});

// POST /api/judging/publish — Coordinator computes and publishes results for an event.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, publishSchema);
    if (parsed.error) return parsed.error;

    const { eventId } = parsed.data;

    const denied = await assertPermission(auth.session.id, "results.manage");
    if (denied) return errorResponse(denied, 403);

    const scopeError = await assertEventScope(auth.session.id, "results.manage", eventId);
    if (scopeError) return errorResponse(scopeError, 403);

    const standings = await getEventStandings(eventId);
    const ranked = standings.entries.filter((e) => e.scores.length > 0);
    if (ranked.length === 0) {
      return errorResponse("No finalised scores yet — judges must submit scores first.", 409);
    }

    const existing = await prisma.result.count({ where: { eventId } });

    const created = await prisma.$transaction(async (tx) => {
      await tx.result.deleteMany({ where: { eventId } });
      const rows: {
        eventId: string;
        teamId?: string;
        participantId?: string;
        score: number;
        rank: number;
        winnerStatus: "WINNER" | "RUNNER_UP" | "NONE";
      }[] = ranked.map((entry, index) => ({
        eventId,
        ...(entry.kind === "team"
          ? { teamId: entry.entryId }
          : { participantId: entry.entryId }),
        score: entry.total,
        rank: index + 1,
        winnerStatus: index === 0 ? "WINNER" : index === 1 ? "RUNNER_UP" : "NONE",
      }));
      await tx.result.createMany({ data: rows });
      return tx.result.findMany({ where: { eventId }, orderBy: { rank: "asc" } });
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.session.id,
        action: existing > 0 ? "RESULT_MODIFIED" : "RESULT_SUBMITTED",
        entityType: "Result",
        entityId: eventId,
        details: { eventId, count: created.length },
      },
    });

    return successResponse({ count: created.length });
  } catch (error) {
    console.error("[POST /api/judging/publish]", error);
    return errorResponse("Internal server error.", 500);
  }
}