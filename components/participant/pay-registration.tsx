"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScreenshotFileField } from "@/components/participant/screenshot-file-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Copy, ExternalLink, Inbox, Check, Landmark, Smartphone } from "lucide-react";

export function PayRegistrationButton({ registrationId, amount }: { registrationId: string; amount: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "offline">("upi");
  const [upiId, setUpiId] = React.useState("");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const upiHandle = "rahulpandiyan@ptyes";
  const upiLink = `upi://pay?pa=${upiHandle}&pn=Rahul%20Pandiyan&am=${amount}&cu=INR&tn=InnovateIgnite-${registrationId.slice(0,8)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiHandle);
      setCopied(true);
      toast.success("UPI ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

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
      const res = await fetch(`/api/registrations/${registrationId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Payment submission failed");
      toast.success("Payment submitted for verification", {
        description: paymentMethod === "offline"
          ? "Offline payment noted. Finance will verify shortly."
          : "Finance will verify shortly. Registration will confirm after verification."
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
        <Button size="sm" className="rounded-full bg-[#0F172A] text-white hover:bg-black">
          Pay ₹{amount}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay ₹{amount}</DialogTitle>
          <DialogDescription>Choose how you want to pay.</DialogDescription>
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
          <>
            {/* QR + UPI section */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1a1a1e] to-[#E11D48]/40 p-3">
                <div className="rounded-2xl bg-white p-3 shadow-inner">
                  <div className="overflow-hidden rounded-xl border-2 border-black">
                    <Image src="/images/upi-qr.png" alt="UPI QR" width={400} height={400} className="h-auto w-full object-contain" />
                  </div>
                </div>
                <p className="mt-2 text-center font-mono text-[10px] tracking-widest text-white/70">Scan with any UPI app • GPay • PhonePe • Paytm</p>
              </div>

              <div className="rounded-xl border border-[#0F172A]/10 bg-[#FFFBEB] p-3">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/50">UPI ID</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold tracking-wide text-[#0F172A]">{upiHandle}</span>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="h-7 rounded-full px-3 text-xs">
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <a
                  href={upiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  Pay ₹{amount} via UPI app <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <p className="mt-1.5 text-center font-mono text-[10px] text-[#0F172A]/40">Opens GPay / PhonePe / Paytm / BHIM</p>
              </div>

              <Alert className="text-xs bg-amber-50 border-amber-200">
                <Inbox className="h-4 w-4" />
                <AlertTitle className="text-amber-900">Manual verification</AlertTitle>
                <AlertDescription className="text-amber-800">After paying, enter the UPI transaction ID and upload the screenshot below. Your registration stays <strong>pending</strong> until finance verifies. You&apos;ll get the QR pass after confirmation.</AlertDescription>
              </Alert>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`upi-${registrationId}`}>UPI transaction ID *</Label>
                <Input id={`upi-${registrationId}`} value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. 4239XYZ123456" required />
              </div>
              <div className="space-y-2">
                <ScreenshotFileField id={`shot-${registrationId}`} value={screenshotUrl} onChange={setScreenshotUrl} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading || !canSubmit} className="rounded-full w-full sm:w-auto">
                  {loading ? "Submitting…" : "Submit for verification"}
                </Button>
              </DialogFooter>
            </form>
          </>
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
              <Button type="submit" disabled={loading} className="rounded-full w-full sm:w-auto">
                {loading ? "Submitting…" : "Confirm offline payment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
