import { requireAuth, successResponse, errorResponse } from "@/lib/apiHelpers";
import { getViewerEventRegistration } from "@/lib/eventDetail";

export async function GET(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { eventId } = await params;
  const registration = await getViewerEventRegistration(eventId, auth.session.id);

  if (!registration) return errorResponse("Not registered for this event.", 404);

  return successResponse({ registration });
}