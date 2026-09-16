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
import { ScreenshotFileField } from "@/components/participant/screenshot-file-field";
import { toast } from "sonner";
import { Inbox, Landmark, Smartphone } from "lucide-react";

export function PayOrderButton({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "offline">("upi");
  const [upiId, setUpiId] = React.useState("");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const canSubmit = paymentMethod === "offline"
    ? true
    : !!upiId.trim() && !!screenshotUrl.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, string> = { paymentMethod };
      if (paymentMethod === "upi") {
        payload.upiTransactionId = upiId.trim();
        payload.paymentScreenshotUrl = screenshotUrl.trim();
      }
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Payment submission failed");
      toast.success("Payment submitted for verification", {
        description: paymentMethod === "offline"
          ? "Offline payment noted. Finance will verify shortly."
          : "An administrator verifies your payment before your registration is confirmed."
      });
      setOpen(false);
      setPaymentMethod("upi");
      setUpiId("");
      setScreenshotUrl("");
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
            Pay ₹{amount} and submit for verification.
          </DialogDescription>
        </DialogHeader>

        {/* Payment method toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("upi")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
              paymentMethod === "upi"
                ? "border-[#0F172A] bg-[#0F172A] text-white"
                : "border-[#0F172A]/15 bg-white text-[#0F172A] hover:bg-gray-50"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            UPI
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("offline")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
              paymentMethod === "offline"
                ? "border-[#0F172A] bg-[#0F172A] text-white"
                : "border-[#0F172A]/15 bg-white text-[#0F172A] hover:bg-gray-50"
            }`}
          >
            <Landmark className="h-4 w-4" />
            Offline
          </button>
        </div>

        {paymentMethod === "upi" ? (
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
              <ScreenshotFileField id={`shot-${orderId}`} value={screenshotUrl} onChange={setScreenshotUrl} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || !canSubmit}>
                {loading ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="text-xs bg-blue-50 border-blue-200">
              <Landmark className="h-4 w-4" />
              <AlertTitle className="text-blue-900">Offline payment</AlertTitle>
              <AlertDescription className="text-blue-800">
                Indicate that you&apos;ve paid offline (cash, cheque, bank transfer, etc.) via your coordinator.
                Finance will confirm shortly — no screenshot needed.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting…" : "Confirm offline payment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
