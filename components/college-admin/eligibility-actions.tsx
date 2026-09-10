"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";

export function EligibilityActions({ attendeeId }: { attendeeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"verify" | "reject" | null>(null);

  async function setStatus(status: "VERIFIED" | "INELIGIBLE") {
    const key = status === "VERIFIED" ? "verify" : "reject";
    setBusy(key);
    try {
      const res = await fetch(`/api/college-admin/attendee/${attendeeId}/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Update failed");
      toast.success(
        status === "VERIFIED" ? "Marked as verified" : "Marked as ineligible"
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={() => setStatus("VERIFIED")}
        disabled={busy !== null}
      >
        <BadgeCheck className="mr-1 h-3 w-3 text-green-600" />
        {busy === "verify" ? "…" : "Verify"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
        onClick={() => setStatus("INELIGIBLE")}
        disabled={busy !== null}
      >
        <BadgeX className="mr-1 h-3 w-3" />
        {busy === "reject" ? "…" : "Flag"}
      </Button>
    </div>
  );
}