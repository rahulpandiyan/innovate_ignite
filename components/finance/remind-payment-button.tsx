"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MailWarning } from "lucide-react";

export function RemindPaymentButton({
  registrationId,
  participantName,
}: {
  registrationId: string;
  participantName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function remind() {
    setBusy(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/remind`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Reminder failed");
      toast.success(`Reminder mail sent to ${participantName}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reminder failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={remind} disabled={busy}>
      <MailWarning className="mr-1 h-3 w-3 text-amber-600" />
      {busy ? "Sending…" : "Remind by mail"}
    </Button>
  );
}
