"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function RegistrationActions({
  registrationId,
  paymentId,
}: {
  registrationId: string;
  paymentId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function verify() {
    setBusy(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Verification failed");
      toast.success("Payment verified, registration confirmed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={verify} disabled={busy}>
      <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
      {busy ? "Verifying…" : "Verify"}
    </Button>
  );
}
