import prisma from "@/lib/db";
import { slugify } from "@/data/eventCategories";
import type { PricingMode } from "@/lib/pricing";

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