"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function ScoreForm({
  eventId,
  category,
  targetId,
  initialScore,
  initialRemarks,
}: {
  eventId: string;
  category: "team" | "solo";
  targetId: string;
  initialScore?: number;
  initialRemarks?: string | null;
}) {
  const router = useRouter();
  const [score, setScore] = React.useState(initialScore ?? "");
  const [remarks, setRemarks] = React.useState(initialRemarks ?? "");
  const [saving, setSaving] = React.useState(false);

  const parsed = typeof score === "string" ? parseFloat(score) : score;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (typeof parsed !== "number" || Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/judging/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, category, targetId, score: parsed, remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to save score");
      toast.success("Score saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save score");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Score"
          className="w-24 font-mono"
          required
        />
        <Button type="submit" size="sm" disabled={saving}>
          <Save className="mr-1 h-3 w-3" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <Textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Remarks (optional)"
        rows={2}
        className="text-xs"
      />
    </form>
  );
}