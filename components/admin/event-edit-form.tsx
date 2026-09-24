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
  coordinators: { id: string; name: string; email: string; role?: string }[];
  judges: { id: string; name: string; email: string }[];
  assignedCoordinators: string[];
  assignedCoordinatorsDetailed?: { id: string; name: string; role?: string }[];
  assignedJudges: string[];
  registrationCount: number;
  teamCount: number;
  onAssign: (input: { eventId: string; coordinatorId?: string; coordinatorIds?: string[]; judgeId?: string; unassignCoordinator?: boolean; unassignCoordinatorId?: string; unassignJudge?: boolean }) => Promise<void>;
}

export function EventEditForm({
  event,
  coordinators,
  judges,
  assignedCoordinators,
  assignedCoordinatorsDetailed,
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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{registrationCount} registrations</Badge>
              <Badge variant="secondary">{teamCount} teams</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Coordinators:</span>
              {assignedCoordinators.length === 0 ? (
                <span className="text-xs text-muted-foreground">None — assign faculty or student coordinators below</span>
              ) : (
                (assignedCoordinatorsDetailed && assignedCoordinatorsDetailed.length > 0
                  ? assignedCoordinatorsDetailed
                  : assignedCoordinators.map((n) => ({ id: n, name: n, role: undefined }))
                ).map((c: any) => (
                  <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs">
                    <span className="font-medium">{c.name}</span>
                    {c.role && <Badge variant={c.role === "EVENT_COORDINATOR" ? "default" : "secondary"} className="text-[10px] h-4 px-1">{c.role === "EVENT_COORDINATOR" ? "Faculty" : "Student"}</Badge>}
                    <button
                      type="button"
                      onClick={async () => {
                        await onAssign({ eventId: event.id, unassignCoordinatorId: c.id });
                        toast.success(`Removed ${c.name}`);
                        router.refresh();
                      }}
                      className="ml-1 rounded-full p-0.5 hover:bg-black/5"
                      aria-label={`Remove ${c.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Judges: {assignedJudges.join(", ") || "None"}
            </div>
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
  coordinators: { id: string; name: string; email?: string; role?: string }[];
  judges: { id: string; name: string }[];
  onAssign: (input: { eventId: string; coordinatorId?: string; coordinatorIds?: string[]; judgeId?: string }) => Promise<void>;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [judgeId, setJudgeId] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0 && !judgeId) return;
    setBusy(true);
    try {
      await onAssign({
        eventId,
        coordinatorIds: selected.length ? selected : undefined,
        judgeId: judgeId || undefined,
      });
      toast.success(selected.length ? `Assigned ${selected.length} coordinator(s)` : "Assigned successfully");
      setSelected([]);
      setJudgeId("");
      router.refresh();
    } catch {
      toast.error("Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium">Add coordinator(s) — faculty or student, select multiple (no limit)</Label>
        <div className="grid gap-1.5 max-h-40 overflow-auto rounded-md border p-2">
          {coordinators.length === 0 ? (
            <span className="text-xs text-muted-foreground">No coordinators found. Create users with EVENT_COORDINATOR / STUDENT_COORDINATOR first.</span>
          ) : (
            coordinators.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-muted text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)))}
                  className="h-3.5 w-3.5"
                />
                <span className="font-medium truncate">{c.name}</span>
                <span className="text-muted-foreground truncate">{c.email}</span>
                {c.role && <Badge variant={c.role === "EVENT_COORDINATOR" ? "default" : "secondary"} className="ml-auto text-[10px] h-4">{c.role === "EVENT_COORDINATOR" ? "Faculty" : "Student"}</Badge>}
              </label>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
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
        <Button type="submit" size="sm" variant="outline" disabled={busy || (selected.length === 0 && !judgeId)}>
          {busy ? "Assigning…" : `Assign${selected.length ? ` (${selected.length})` : ""}`}
        </Button>
      </div>
    </form>
  );
}
