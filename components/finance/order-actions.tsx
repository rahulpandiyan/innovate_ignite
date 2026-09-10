"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<"verify" | "reject" | null>(null);
  const [showReason, setShowReason] = React.useState(false);
  const [reason, setReason] = React.useState("");

  async function verify() {
    setBusy("verify");
    try {
      const res = await fetch(`/api/payments/${orderId}/verify`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Verification failed");
      toast.success("Payment verified, registrations created");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(null);
    }
  }

  async function reject(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 3) {
      toast.error("Enter a rejection reason");
      return;
    }
    setBusy("reject");
    try {
      const res = await fetch(`/api/payments/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Rejection failed");
      toast.success("Payment submission rejected");
      setShowReason(false);
      setReason("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={verify} disabled={busy !== null}>
          <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
          {busy === "verify" ? "Verifying…" : "Verify"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={() => setShowReason((v) => !v)}
          disabled={busy !== null}
        >
          <XCircle className="mr-1 h-3 w-3" />
          Reject
        </Button>
      </div>
      {showReason && (
        <form onSubmit={reject} className="flex w-full max-w-xs gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason"
            className="h-8 text-xs"
            autoFocus
          />
          <Button size="sm" type="submit" disabled={busy !== null}>
            {busy === "reject" ? "…" : "Confirm"}
          </Button>
        </form>
      )}
    </div>
  );
}