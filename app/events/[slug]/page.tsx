import { notFound } from "next/navigation";
import { eventCategories } from "@/data/eventCategories";
import { eventsList } from "@/data/eventList";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return eventCategories.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const category = eventCategories.find((e) => e.slug === slug);
  if (!category) notFound();

  const details = eventsList.filter((e) => e.slug === slug);

  return <EventDetailClient category={category} details={details} />;
}
