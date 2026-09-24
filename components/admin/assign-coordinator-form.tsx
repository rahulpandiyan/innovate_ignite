"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      router.refresh();
    } catch {
      toast.error("Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <Label>Coordinator (all)</Label>
        <Select value={userId} onValueChange={setUserId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select coordinator" />
          </SelectTrigger>
          <SelectContent>
            {coordinators.length === 0 ? (
              <SelectItem value="__none" disabled>No coordinators yet — create one above</SelectItem>
            ) : (
              coordinators.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} — {u.role === "EVENT_COORDINATOR" ? "Faculty" : "Student"} ({u.email})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-1">
        <Label>Event</Label>
        <Select value={eventId} onValueChange={setEventId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" className="h-9 shrink-0" disabled={busy || !userId || !eventId}>
        {busy ? "Assigning…" : "Assign"}
      </Button>
    </form>
  );
}
