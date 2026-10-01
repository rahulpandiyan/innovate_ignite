// Single source of truth for what to display as an event's name when the
// participant chose a sub-option during registration (BGMI vs Free Fire).
// The choice is stored in Registration.formResponses.game at register time
// (see app/api/events/[eventId]/register/route.ts). Every panel that shows
// a registration's event should use displayEventName() instead of the raw
// event name, otherwise gaming rows all read "BGMI & FreeFire".

export const GAMING_EVENT_NAME = "BGMI & FreeFire";

export const GAME_CHOICES = ["BGMI", "Free Fire"] as const;
export type GameChoice = (typeof GAME_CHOICES)[number];

export function getGameChoice(
  eventName: string | null | undefined,
  formResponses: unknown
): GameChoice | null {
  if (eventName !== GAMING_EVENT_NAME) return null;
  if (!formResponses || typeof formResponses !== "object") return null;
  const game = (formResponses as Record<string, unknown>).game;
  if (typeof game === "string" && (GAME_CHOICES as readonly string[]).includes(game)) {
    return game as GameChoice;
  }
  return null;
}

export function displayEventName(
  eventName: string,
  formResponses: unknown
): string {
  return getGameChoice(eventName, formResponses) ?? eventName;
}
