"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function AnnouncementForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Announcement failed");
      toast.success("Announcement sent");
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Announcement failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ann-title">Title</Label>
        <Input
          id="ann-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Registration extended"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ann-body">Message</Label>
        <Textarea
          id="ann-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details participants need to know…"
          rows={4}
        />
      </div>
      <Button type="submit" disabled={loading || !title.trim() || !body.trim()}>
        <Send className="mr-1 h-4 w-4" />
        {loading ? "Sending…" : "Send announcement"}
      </Button>
    </form>
  );
}