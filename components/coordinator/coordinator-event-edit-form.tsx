"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Pencil, Save, X, Loader2 } from "lucide-react";

const CATEGORIES = ["TECHNICAL", "GENERAL", "DANCE", "GAMING", "THEATRE", "FINE_ARTS"];
const PRICING_MODES = ["PER_TEAM", "PER_PARTICIPANT", "SOLO_OR_GROUP"] as const;

interface EventData {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  venue: string;
  price: number;
  priceMode: string;
  groupPrice?: number;
  minTeamSize: number;
  maxTeamSize: number;
  time: string;
  date: string;
  rules: string;
}

interface Props {
  event: EventData;
}

export function CoordinatorEventEditForm({ event }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: event.name,
    description: event.description,
    type: event.type,
    category: event.category,
    venue: event.venue,
    price: event.price,
    priceMode: event.priceMode,
    groupPrice: event.groupPrice ?? event.price,
    minTeamSize: event.minTeamSize,
    maxTeamSize: event.maxTeamSize,
    time: event.time,
    date: event.date,
    rules: event.rules,
  });
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
        venue: form.venue,
        price: form.price,
        priceMode: form.priceMode,
        groupPrice:
          form.priceMode === "SOLO_OR_GROUP"
            ? form.groupPrice || form.price
            : form.groupPrice || null,
        minTeamSize: form.minTeamSize,
        maxTeamSize: form.maxTeamSize,
        time: form.time,
      };
      if (form.date) payload.date = new Date(form.date + "T00:00:00.000Z").toISOString();
      if (form.rules.trim()) payload.rules = form.rules;
      const res = await fetch("/api/events/" + event.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  if (!editing) {
    return (
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="mr-1 h-3 w-3" /> Edit event
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-[#2362EC]/20 bg-[#EFF6FF] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#2362EC]">Edit event details</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            <X className="mr-1 h-3 w-3" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#0F172A] text-white hover:bg-black">
            {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SOLO">SOLO</SelectItem>
              <SelectItem value="TEAM">TEAM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Venue</Label>
          <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Price (INR)</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Pricing mode</Label>
          <Select value={form.priceMode} onValueChange={(v) => setForm({ ...form, priceMode: v })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRICING_MODES.map((m) => (
                <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Group price (for Solo/Group)</Label>
          <Input type="number" min={0} value={form.groupPrice} onChange={(e) => setForm({ ...form, groupPrice: Number(e.target.value) })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Time</Label>
          <Input value={form.time} placeholder="e.g. 02:00 PM – 04:30 PM" onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Min team size</Label>
          <Input type="number" min={1} value={form.minTeamSize} onChange={(e) => setForm({ ...form, minTeamSize: Number(e.target.value) })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max team size</Label>
          <Input type="number" min={1} value={form.maxTeamSize} onChange={(e) => setForm({ ...form, maxTeamSize: Number(e.target.value) })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Description</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Rules (one per line)</Label>
          <textarea
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-[#0F172A]/15 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#0F172A]/35 focus:border-[#2362EC]/40 focus:outline-none focus:ring-4 focus:ring-[#2362EC]/10"
          />
        </div>
      </div>
    </div>
  );
}
