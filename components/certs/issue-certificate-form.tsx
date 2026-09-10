"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Award } from "lucide-react";

type Option = { id: string; name: string };

const CERT_TYPES = [
  { value: "PARTICIPATION", label: "Participation" },
  { value: "WINNER", label: "Winner" },
  { value: "RUNNER_UP", label: "Runner-up" },
  { value: "SPECIAL_RECOGNITION", label: "Special recognition" },
] as const;

export function IssueCertificateForm({
  events,
  eligible,
  templates,
}: {
  events: Option[];
  eligible: Record<string, { participantId: string; name: string; college: string }[]>;
  templates: { id: string; name: string; type: string }[];
}) {
  const router = useRouter();
  const [eventId, setEventId] = React.useState("");
  const [participantId, setParticipantId] = React.useState("");
  const [type, setType] = React.useState<(typeof CERT_TYPES)[number]["value"]>("PARTICIPATION");
  const [submitting, setSubmitting] = React.useState(false);

  const participants = eventId ? (eligible[eventId] ?? []) : [];
  const matchingTemplates = templates.filter((t) => t.type === type);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId || !participantId) {
      toast.error("Choose an event and a participant");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          eventId,
          type,
          templateId: matchingTemplates[0]?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to issue certificate");
      const [name, certId] = [data.data.participantName, data.data.certificateId];
      if (data.data.created) {
        toast.success(`Certificate ${certId} issued to ${name}`);
      } else {
        toast.info(`Certificate already exists for ${name}`);
      }
      setParticipantId("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to issue certificate");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Event</label>
        <Select value={eventId} onValueChange={(v) => { setEventId(v); setParticipantId(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select an event" />
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

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Participant</label>
        <Select value={participantId} onValueChange={setParticipantId}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                eventId
                  ? participants.length
                    ? `Select participant (${participants.length})`
                    : "No confirmed participants"
                  : "Choose an event first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.participantId} value={p.participantId}>
                {p.name} — {p.college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Certificate type</label>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CERT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        <Award className="mr-1 h-4 w-4" />
        {submitting ? "Issuing…" : "Issue certificate"}
      </Button>
    </form>
  );
}