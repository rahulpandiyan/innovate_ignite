import { notFound, redirect } from "next/navigation";
import { eventCategories } from "@/data/eventCategories";
import { eventsList } from "@/data/eventList";
import { getPublicEventBySlug } from "@/lib/eventDetail";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Detail pages reflect admin/coordinator edits, so always render from the DB.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return eventCategories.map((e) => ({ slug: e.slug }));
}

// Legacy slugs (renamed events) -> current canonical slugs, so old shared URLs don't 404
const LEGACY_REDIRECTS: Record<string, string> = {
  "dance-elite": "/events/danceexe",
  "techninja": "/events/techninja-quiz",
  "mini-project-presentation": "/events/mini-project-expo",
  "crucial-beats-singing": "/events/crucial-beats",
  "photography": "/events/pixels-photography",
  "symposium-group-discussion": "/events/group-discussion",
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const legacy = LEGACY_REDIRECTS[slug];
  if (legacy) redirect(legacy);

  const category = eventCategories.find((e) => e.slug === slug);
  if (!category) notFound();

  const details = eventsList.filter((e) => e.slug === slug);
  const dbEvent = await getPublicEventBySlug(category.slug, category.eventName);

  return <EventDetailClient category={category} details={details} dbEvent={dbEvent} />;
}
