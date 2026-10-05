import prisma from "@/lib/db";
import { slugify } from "@/data/eventCategories";
import { getAuthSession } from "@/lib/authCookie";
import type { PricingMode } from "@/lib/pricing";

// The signed-in viewer's own registration for an event, trimmed to what the
// detail page / registration API need to answer "what should this button do?".
export interface ViewerEventRegistration {
  id: string;
  registrationId: string;
  status: string;
  eventName: string;
  /** Amount the payment sheet asks for (matches what POST /pay records). */
  price: number;
  paymentStatus: string | null;
  needsPayment: boolean;
}

// Public face of an Event row, serialized so it can cross the
// server -> client boundary and be used by the detail page.
export interface PublicEventDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceMode: PricingMode;
  groupPrice: number | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  rules: string | null;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  type: string;
  category: string;
  status: string;
  coordinatorContacts: { id: string; name: string; phone: string | null; isStaff: boolean }[];
}

// Match by slug first (stable against renames), falling back to the exact
// display name so events whose slug differs from the static sheet still resolve.
export async function getPublicEventBySlug(
  slug: string,
  eventName: string
): Promise<PublicEventDetail | null> {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      category: true,
      price: true,
      priceMode: true,
      groupPrice: true,
      date: true,
      time: true,
      venue: true,
      rules: true,
      minTeamSize: true,
      maxTeamSize: true,
      status: true,
      coordinatorContacts: {
        select: { id: true, name: true, phone: true, isStaff: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Match by slug first (stable against renames), falling back to the exact
// display name so events whose slug differs from the static sheet still resolve.
  const match = events.find(
    (e) =>
      (e.slug != null && e.slug === slug) ||
      slugify(e.name) === slug ||
      e.name === eventName
  );
  if (!match) return null;

  return {
    id: match.id,
    name: match.name,
    description: match.description,
    price: Number(match.price),
    priceMode: match.priceMode,
    groupPrice: match.groupPrice !== null ? Number(match.groupPrice) : null,
    date: match.date ? match.date.toISOString() : null,
    time: match.time,
    venue: match.venue,
    rules: match.rules,
    minTeamSize: match.minTeamSize,
    maxTeamSize: match.maxTeamSize,
    type: match.type,
    category: match.category,
    status: match.status,
    coordinatorContacts: match.coordinatorContacts.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      isStaff: c.isStaff,
    })),
  };
}

// Whether the viewer already holds a spot for this event, and whether money is
// still owed for it. `userId` is passed in by API routes that already resolved
// the session; the detail page lets us read it from the cookie instead.
export async function getViewerEventRegistration(
  eventId: string,
  userId?: string
): Promise<ViewerEventRegistration | null> {
  const viewerId = userId ?? (await getAuthSession())?.id;
  if (!viewerId) return null;

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: viewerId, eventId } },
    include: {
      payment: { select: { status: true } },
      event: { select: { price: true, name: true } },
    },
  });
  if (!registration) return null;

  const price = Number(registration.event.price ?? 0);
  const paymentStatus = registration.payment?.status ?? null;

  return {
    id: registration.id,
    registrationId: registration.registrationId,
    status: registration.status,
    eventName: registration.event.name,
    price,
    paymentStatus,
    needsPayment: registration.status === "PENDING" && price > 0 && paymentStatus !== "SUCCESS",
  };
}
