"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["DRAFT", "OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] as const;
const CATEGORIES = ["TECHNICAL", "GENERAL", "DANCE", "GAMING", "THEATRE", "FINE_ARTS"];

interface EventData {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  venue: string;
  price: number;
  minTeamSize: number;
  maxTeamSize: number;
  status: string;
  time: string;
}

interface Props {
  event: EventData;
  coordinators: { id: string; name: string; email: string }[];
  judges: { id: string; name: string; email: string }[];
  assignedCoordinators: string[];
  assignedJudges: string[];
  registrationCount: number;
  teamCount: number;
  onAssign: (input: { eventId: string; coordinatorId?: string; judgeId?: string; unassignCoordinator?: boolean; unassignJudge?: boolean }) => Promise<void>;
}

export function EventEditForm({
  event,
  coordinators,
  judges,
  assignedCoordinators,
  assignedJudges,
  registrationCount,
  teamCount,
  onAssign,
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: event.name,
    description: event.description,
    type: event.type,
    category: event.category,
    venue: event.venue,
    price: event.price,
    minTeamSize: event.minTeamSize,
    maxTeamSize: event.maxTeamSize,
    status: event.status,
    time: event.time,
  });
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/events/" + event.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Update failed");
      toast.success("Event updated");
      setEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{event.name}</CardTitle>
          <CardDescription>
            {event.category.replace(/_/g, " ")} · {event.type} · ₹{event.price} · {event.status}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{event.status}</Badge>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                <X className="mr-1 h-3 w-3" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLO">SOLO</SelectItem>
                  <SelectItem value="TEAM">TEAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Price (INR)</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Min team size</Label>
              <Input type="number" min={1} value={form.minTeamSize} onChange={(e) => setForm({ ...form, minTeamSize: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>Max team size</Label>
              <Input type="number" min={1} value={form.maxTeamSize} onChange={(e) => setForm({ ...form, maxTeamSize: Number(e.target.value) })} />
            </div>
            <div className="space-y-1 md:col-span-4">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">{registrationCount} registrations</Badge>
            <Badge variant="secondary">{teamCount} teams</Badge>
            <span className="text-muted-foreground">
              Coordinators: {assignedCoordinators.join(", ") || "None"}
            </span>
            <span className="text-muted-foreground">
              Judges: {assignedJudges.join(", ") || "None"}
            </span>
          </div>
        )}

        {/* Assign coordinator & judge — always visible */}
        <div className="flex flex-wrap items-end gap-3 border-t pt-4">
          <AssignForm
            eventId={event.id}
            coordinators={coordinators}
            judges={judges}
            onAssign={onAssign}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AssignForm({
  eventId,
  coordinators,
  judges,
  onAssign,
}: {
  eventId: string;
  coordinators: { id: string; name: string }[];
  judges: { id: string; name: string }[];
  onAssign: (input: { eventId: string; coordinatorId?: string; judgeId?: string }) => Promise<void>;
}) {
  const [coordId, setCoordId] = React.useState("");
  const [judgeId, setJudgeId] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onAssign({
        eventId,
        coordinatorId: coordId || undefined,
        judgeId: judgeId || undefined,
      });
      toast.success("Assigned successfully");
      router.refresh();
    } catch {
      toast.error("Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <Select value={coordId} onValueChange={setCoordId}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Assign coordinator" />
        </SelectTrigger>
        <SelectContent>
          {coordinators.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={judgeId} onValueChange={setJudgeId}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Assign judge" />
        </SelectTrigger>
        <SelectContent>
          {judges.map((j) => (
            <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" variant="outline" disabled={busy}>
        {busy ? "Assigning…" : "Assign"}
      </Button>
    </form>
  );
}
