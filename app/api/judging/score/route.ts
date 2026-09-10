import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";
import { assertPermission, assertEventScope } from "@/lib/rbac";
import { z } from "zod";

const scoreSchema = z.object({
  eventId: z.string().min(1),
  category: z.enum(["team", "solo"]),
  targetId: z.string().min(1),
  score: z.number().min(0).max(100),
  remarks: z.string().max(1000).optional(),
});

// POST /api/judging/score — Judge submits a final score for an entry.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, scoreSchema);
    if (parsed.error) return parsed.error;

    const { eventId, category, targetId, score, remarks } = parsed.data;

    const denied = await assertPermission(auth.session.id, "results.score");
    if (denied) return errorResponse(denied, 403);

    const scopeError = await assertEventScope(auth.session.id, "results.score", eventId);
    if (scopeError) return errorResponse(scopeError, 403);

    const existing = await prisma.judgeScore.findFirst({
      where: {
        eventId,
        judgeId: auth.session.id,
        ...(category === "team"
          ? { teamId: targetId }
          : { participantId: targetId }),
      },
    });

    const saved = existing
      ? await prisma.judgeScore.update({
          where: { id: existing.id },
          data: { score, remarks: remarks ?? null, isFinal: true },
        })
      : await prisma.judgeScore.create({
          data: {
            eventId,
            judgeId: auth.session.id,
            ...(category === "team"
              ? { teamId: targetId }
              : { participantId: targetId }),
            score,
            remarks: remarks ?? null,
            isFinal: true,
          },
        });

    await prisma.auditLog.create({
      data: {
        userId: auth.session.id,
        action: existing ? "RESULT_MODIFIED" : "RESULT_SUBMITTED",
        entityType: "JudgeScore",
        entityId: saved.id,
        details: { eventId, category, targetId, score },
      },
    });

    return successResponse({
      id: saved.id,
      score: Number(saved.score),
      isFinal: saved.isFinal,
      remarks: saved.remarks,
      submittedAt: saved.submittedAt,
    });
  } catch (error) {
    console.error("[POST /api/judging/score]", error);
    return errorResponse("Internal server error.", 500);
  }
}