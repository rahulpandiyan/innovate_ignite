"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function InviteActions({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"ACCEPT" | "REJECT" | null>(null);

  async function respond(action: "ACCEPT" | "REJECT") {
    setBusy(action);
    try {
      const res = await fetch(`/api/invites/${inviteId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Request failed");
      toast.success(action === "ACCEPT" ? "You joined the team" : "Invite declined");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => respond("ACCEPT")}
        disabled={busy !== null}
      >
        <Check className="mr-1 h-4 w-4" /> Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => respond("REJECT")}
        disabled={busy !== null}
      >
        <X className="mr-1 h-4 w-4" /> Decline
      </Button>
    </div>
  );
}