"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, HandCoins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function RegistrationActions({
  registrationId,
  paymentId,
  paymentStatus,
  onCollect,
}: {
  registrationId: string;
  paymentId: string;
  paymentStatus?: string;
  onCollect?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [collectOpen, setCollectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [txnId, setTxnId] = React.useState("");

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

  async function collect() {
    setBusy(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txnId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Collection failed");
      toast.success("Payment marked as collected. Awaiting finance verification.");
      setCollectOpen(false);
      setTxnId("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Collection failed");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Rejection failed");
      toast.success("Registration rejected");
      setRejectOpen(false);
      setRejectReason("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex gap-1">
        {onCollect && paymentStatus === "PENDING" && (
          <Button size="sm" variant="outline" onClick={() => setCollectOpen(true)} disabled={busy}>
            <HandCoins className="mr-1 h-3 w-3 text-blue-600" />
            Collect
          </Button>
        )}
        {(paymentStatus === "PENDING" || paymentStatus === "COORDINATOR_COLLECTED") && (
          <Button size="sm" variant="outline" onClick={verify} disabled={busy}>
            <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
            {busy ? "Verifying…" : "Verify"}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)} disabled={busy} className="text-red-600 hover:text-red-700">
          <XCircle className="mr-1 h-3 w-3" />
          Reject
        </Button>
      </div>

      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Collected</DialogTitle>
            <DialogDescription>
              Confirm that you have received the payment from the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">UPI Transaction ID (optional for cash)</label>
              <input
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter UPI txn ID or leave blank for cash"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectOpen(false)}>Cancel</Button>
            <Button onClick={collect} disabled={busy}>{busy ? "Collecting…" : "Confirm Collection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              This will cancel the registration. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Enter rejection reason (e.g., payment issue, invalid details)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={reject} disabled={busy}>{busy ? "Rejecting…" : "Reject"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
