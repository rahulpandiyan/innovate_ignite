import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/apiResponse";

const PatchSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

const LATENT_EVENT_NAME = "VVIT GOT LATENT";

export async function PATCH(req: NextRequest, context: { params: Promise<{ registrationId: string }> }) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON", 400);
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid answers", 400);
  const { answers } = parsed.data;

  const { registrationId } = await context.params;

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      id: true,
      userId: true,
      event: { select: { name: true } },
      formResponses: true,
    },
  });
  if (!reg) return errorResponse("Registration not found", 404);
  if (reg.userId !== session.id && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    return errorResponse("Forbidden", 403);
  }
  if (reg.event.name !== LATENT_EVENT_NAME) {
    return errorResponse("This registration is not for VVIT GOT LATENT", 400);
  }

  const entries = Object.entries(answers)
    .filter(([q, a]) => typeof q === "string" && typeof a === "string" && a.trim().length > 0)
    .slice(0, 20)
    .map(([q, a]) => [q.slice(0, 300), (a as string).slice(0, 2000)] as const);

  const latentAnswers = Object.fromEntries(entries);
  const current = (reg.formResponses as any) || {};
  const next = { ...current, latentAnswers };

  await prisma.registration.update({
    where: { id: registrationId },
    data: { formResponses: next },
  });

  return successResponse({ ok: true });
}
