"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/components/ui/searchable-select";

type Props = {
  coordinators: { id: string; name: string; email: string; role?: string }[];
  events: { id: string; name: string }[];
  onAssign: (input: { userId: string; eventIds: string[] }) => Promise<void>;
};

export function AssignCoordinatorForm({ coordinators, events, onAssign }: Props) {
  const [userId, setUserId] = React.useState("");
  const [eventId, setEventId] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  // One search box covers both pickers: typing filters coordinators first and,
  // once you narrow to the right person, the event box narrows to the same text.
  const [peopleQuery, setPeopleQuery] = React.useState("");
  const [eventQuery, setEventQuery] = React.useState("");

  const coordinatorOptions: SearchableOption[] = React.useMemo(
    () =>
      coordinators.map((u) => ({
        value: u.id,
        label: u.name,
        description: `${u.role === "EVENT_COORDINATOR" ? "Faculty" : "Student"} · ${u.email}`,
        keywords: u.email,
      })),
    [coordinators]
  );

  const eventOptions: SearchableOption[] = React.useMemo(
    () => events.map((e) => ({ value: e.id, label: e.name })),
    [events]
  );

  function matches(text: string, query: string) {
    if (!query.trim()) return true;
    return text.toLowerCase().includes(query.trim().toLowerCase());
  }

  const peopleShown = coordinatorOptions.filter((o) =>
    matches(`${o.label} ${o.description ?? ""}`, peopleQuery)
  );
  const eventsShown = eventOptions.filter((o) => matches(o.label, eventQuery));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !eventId) {
      toast.error("Select both coordinator and event");
      return;
    }
    setBusy(true);
    try {
      await onAssign({ userId, eventIds: [eventId] });
      toast.success("Assigned successfully");
      setUserId("");
      setEventId("");
      setPeopleQuery("");
      setEventQuery("");
      router.refresh();
    } catch {
      toast.error("Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="coord-search">Find coordinator</Label>
          <input
            id="coord-search"
            value={peopleQuery}
            onChange={(e) => setPeopleQuery(e.target.value)}
            placeholder="Type a name or email…"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            {peopleQuery.trim()
              ? `${peopleShown.length} of ${coordinatorOptions.length} match`
              : `${coordinatorOptions.length} faculty & student coordinators`}
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="event-search">Find event</Label>
          <input
            id="event-search"
            value={eventQuery}
            onChange={(e) => setEventQuery(e.target.value)}
            placeholder="Type an event name…"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            {eventQuery.trim()
              ? `${eventsShown.length} of ${eventOptions.length} match`
              : `${eventOptions.length} events`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label>Coordinator</Label>
          {peopleShown.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              No coordinator matches “{peopleQuery}” — clear the search or create the account above.
            </p>
          ) : (
            <SearchableSelect
              options={peopleShown}
              value={userId ? [userId] : []}
              onChange={(v) => setUserId(v[0] ?? "")}
              placeholder="Select coordinator"
              searchPlaceholder="Search name or email…"
              emptyText="No match."
            />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Label>Event</Label>
          {eventsShown.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              No event matches “{eventQuery}”.
            </p>
          ) : (
            <SearchableSelect
              options={eventsShown}
              value={eventId ? [eventId] : []}
              onChange={(v) => setEventId(v[0] ?? "")}
              placeholder="Select event"
              searchPlaceholder="Search events…"
              emptyText="No match."
            />
          )}
        </div>
        <Button type="submit" size="sm" className="h-9 shrink-0" disabled={busy || !userId || !eventId}>
          {busy ? "Assigning…" : "Assign"}
        </Button>
      </div>
    </form>
  );
}