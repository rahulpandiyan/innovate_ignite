"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Inbox } from "lucide-react";

export function PayRegistrationButton({ registrationId, amount }: { registrationId: string; amount: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [upiId, setUpiId] = React.useState("");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiTransactionId: upiId.trim(), paymentScreenshotUrl: screenshotUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Payment submission failed");
      toast.success("Payment submitted for verification", { description: "Finance will verify shortly. Registration will confirm after verification." });
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
        <Button size="sm" className="rounded-full bg-[#0F172A] text-white hover:bg-black">
          Pay ₹{amount}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Submit payment</DialogTitle>
          <DialogDescription>Pay ₹{amount} via UPI and share the transaction ID + screenshot. Finance will verify before confirmation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="text-xs">
            <Inbox className="h-4 w-4" />
            <AlertTitle>Manual verification</AlertTitle>
            <AlertDescription>Your registration stays pending until finance verifies the payment. You’ll get the QR pass after confirmation.</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor={`upi-${registrationId}`}>UPI transaction ID</Label>
            <Input id={`upi-${registrationId}`} value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. 4239XYZ123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`shot-${registrationId}`}>Screenshot URL</Label>
            <Input id={`shot-${registrationId}`} value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="https://…/payment.png" type="url" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !upiId.trim() || !screenshotUrl.trim()} className="rounded-full">
              {loading ? "Submitting…" : "Submit for verification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
