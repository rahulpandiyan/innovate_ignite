"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Inbox } from "lucide-react";

export function PayOrderButton({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [upiId, setUpiId] = React.useState("");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiTransactionId: upiId.trim(),
          paymentScreenshotUrl: screenshotUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Payment submission failed");
      toast.success("Payment submitted for verification");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit payment</DialogTitle>
          <DialogDescription>
            Pay ₹{amount} via UPI and share the transaction ID + screenshot.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="text-xs">
            <Inbox className="h-4 w-4" />
            <AlertTitle>Manual verification</AlertTitle>
            <AlertDescription>
              An administrator verifies your payment before your registration is confirmed.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="upi">UPI transaction ID</Label>
            <Input
              id="upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. 4239XYZ1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shot">Screenshot URL</Label>
            <Input
              id="shot"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://…/payment.png"
              type="url"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !upiId.trim() || !screenshotUrl.trim()}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}