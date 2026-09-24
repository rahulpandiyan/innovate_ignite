"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Plus } from "lucide-react";

type TeamEvent = {
  id: string;
  name: string;
  price: number;
  maxTeamSize: number | null;
};

export function CreateTeamDialog({ events }: { events: TeamEvent[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [eventId, setEventId] = React.useState("");
  const [members, setMembers] = React.useState<{ name: string; phone: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  const selectedEvent = events.find((e) => e.id === eventId);
  const maxAdditional = selectedEvent ? Math.max(0, (selectedEvent.maxTeamSize ?? 12) - 1) : 0;

  React.useEffect(() => {
    if (selectedEvent) {
      setMembers((prev) => prev.slice(0, maxAdditional));
    }
  }, [selectedEvent?.id, maxAdditional]);

  function updateMember(idx: number, field: "name" | "phone", value: string) {
    setMembers((prev) => {
      const next = [...prev];
      if (!next[idx]) next[idx] = { name: "", phone: "" };
      next[idx] = { ...next[idx], [field]: field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value };
      return next;
    });
  }

  function addMemberRow() {
    if (members.length >= maxAdditional) return;
    setMembers((prev) => [...prev, { name: "", phone: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !eventId) return;
    const cleaned = members
      .map((m) => ({ name: m.name.trim(), phone: m.phone.replace(/\D/g, "") }))
      .filter((m) => m.name && m.phone);
    // validate phones
    for (const m of cleaned) {
      if (!/^\d{10}$/.test(m.phone)) {
        toast.error(`Mobile for ${m.name} must be 10 digits`);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), eventId, members: cleaned.length ? cleaned : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to create team");
      toast.success(cleaned.length ? `Team created with ${cleaned.length} teammate(s)` : "Team created");
      setName("");
      setEventId("");
      setMembers([]);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Create team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>
            Pick a team event and give your team a name. You&apos;ll be the leader — add teammates directly, no invite needed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-event">Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger id="team-event">
                <SelectValue placeholder="Select a team event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name} — ₹{ev.price} ({ev.maxTeamSize ?? "∞"} max)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pulse Harmony"
            />
          </div>

          {selectedEvent && maxAdditional > 0 && (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Teammates — they don’t need an account, just add their details</Label>
                <span className="font-mono text-[11px] text-muted-foreground">{members.filter((m) => m.name.trim() && m.phone).length}/{maxAdditional} added</span>
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground">No teammates added yet. Click Add teammate if you want to add now, or you can add later from My Teams.</p>
              ) : (
                members.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <Input placeholder={`Teammate ${idx + 1} name`} value={m.name} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                    <div className="flex gap-2">
                      <Input placeholder="Mobile (10 digits)" value={m.phone} onChange={(e) => updateMember(idx, "phone", e.target.value)} inputMode="numeric" className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setMembers((prev) => prev.filter((_, i) => i !== idx))} className="shrink-0">Remove</Button>
                    </div>
                  </div>
                ))
              )}
              {members.length < maxAdditional && (
                <Button type="button" variant="outline" size="sm" onClick={addMemberRow} className="w-full">
                  + Add teammate {members.length + 1}
                </Button>
              )}
              <p className="font-mono text-[11px] text-muted-foreground">Teammates don’t need to register separately — leader provides their details.</p>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim() || !eventId}>
              {loading ? "Creating…" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}