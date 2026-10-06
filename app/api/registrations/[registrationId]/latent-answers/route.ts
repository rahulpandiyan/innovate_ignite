import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/apiHelpers";
import { Prisma } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ registrationId: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse("Unauthorized", 401);

    const { answers } = await req.json();
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return errorResponse("Invalid answers", 400);
    }

    const { registrationId } = await params;
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { id: true, userId: true, formResponses: true, event: { select: { name: true } } },
    });
    if (!reg) return errorResponse("Registration not found", 404);
    if (reg.userId !== session.id) return errorResponse("Forbidden", 403);

    const latentAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([k, v]) => {
      if (typeof k === "string" && typeof v === "string") {
        latentAnswers[k.slice(0, 300)] = v.slice(0, 2000);
      }
    });

    const existing = (reg.formResponses as Prisma.JsonObject) || {};
    const updated = { ...existing, latentAnswers } as Prisma.JsonObject;

    await prisma.registration.update({
      where: { id: reg.id },
      data: { formResponses: updated },
    });

    return successResponse({ ok: true });
  } catch (e: any) {
    console.error(e);
    return errorResponse(e?.message ?? "Failed to save answers", 500);
  }
}
