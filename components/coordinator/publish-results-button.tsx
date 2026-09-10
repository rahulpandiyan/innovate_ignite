"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

export function PublishResultsButton({
  eventId,
  hasResults,
}: {
  eventId: string;
  hasResults: boolean;
}) {
  const router = useRouter();
  const [publishing, setPublishing] = React.useState(false);

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch("/api/judging/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Failed to publish results");
      toast.success(hasResults ? "Results updated" : "Results published");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Button onClick={publish} disabled={publishing} size="sm">
      <Trophy className="mr-1 h-4 w-4" />
      {publishing
        ? "Publishing…"
        : hasResults
          ? "Re-publish results"
          : "Publish results"}
    </Button>
  );
}