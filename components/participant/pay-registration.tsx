"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScreenshotFileField } from "@/components/participant/screenshot-file-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Copy, ExternalLink, Check, Landmark, Smartphone } from "lucide-react";

type PaySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  amount: number;
  onSubmitted?: () => void;
};

export function PaySheet({ open, onOpenChange, registrationId, amount, onSubmitted }: PaySheetProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "offline">("upi");
  const [upiId, setUpiId] = React.useState("");
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const upiHandle = "fetch741264.rzp@rxairtel";
  const upiLink = `upi://pay?pa=${upiHandle}&pn=Fetch&am=${amount}&cu=INR&tn=InnovateIgnite-${registrationId.slice(0, 8)}`;

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

  const reset = () => {
    setPaymentMethod("upi");
    setUpiId("");
    setScreenshotUrl("");
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
      onOpenChange(false);
      reset();
      router.refresh();
      onSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border-t border-[#0F172A]/10 bg-white p-0 sm:max-w-md sm:rounded-t-[28px]"
      >
        {/* drag handle */}
        <div className="sticky top-0 z-10 bg-white pt-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[#0F172A]/15" />
        </div>

        <div className="px-5 pb-6 pt-2">
          <SheetTitle className="sr-only">Pay ₹{amount}</SheetTitle>

          {/* Razorpay-style amount header */}
          <div className="flex items-center justify-between rounded-2xl bg-[#0F172A] px-4 py-3.5 text-white">
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/60">Amount payable</p>
              <p className="text-2xl font-black tracking-tight">₹{amount}</p>
            </div>
            <div className="text-right font-mono text-[11px] leading-5 text-white/60">
              Innovate Ignite &apos;26
              <br />
              VVIT Bengaluru
            </div>
          </div>

          {/* Payment method toggle */}
          <div className="mt-4 grid grid-cols-2 gap-2">
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
              <div className="mt-4 space-y-4">
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

                <div className="space-y-2.5 rounded-xl border-2 border-amber-300/70 bg-[#FFFBEB] p-3.5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F172A]/55">How to pay</p>
                  <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-[#0F172A]/80 marker:font-mono marker:font-bold marker:text-[#0F172A]/60">
                    <li>
                      Pay <span className="font-bold text-[#0F172A]">₹{amount}</span> only to this UPI ID:{" "}
                      <span className="font-mono font-bold text-[#0F172A]">{upiHandle}</span> — scan the QR above or tap “Pay
                      ₹{amount} via UPI app”.
                    </li>
                    <li>
                      After paying, take a <strong>screenshot</strong> of the success screen and{" "}
                      <strong>upload it below</strong> together with the UPI transaction ID, then submit.
                    </li>
                    <li>
                      Payment problem? Contact the Event Coordinator{" "}
                      <strong>Sam Goldwin</strong> at{" "}
                      <a href="tel:+919739431299" className="font-bold text-[#0F172A] underline underline-offset-2 hover:text-black">
                        +91 97394 31299
                      </a>
                      .
                    </li>
                  </ol>
                  <p className="text-[10px] leading-relaxed text-[#0F172A]/55">
                    Your registration stays <strong>pending</strong> until finance verifies the screenshot. You&apos;ll get the
                    QR pass after confirmation.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`upi-${registrationId}`}>UPI transaction ID *</Label>
                  <Input id={`upi-${registrationId}`} value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. 4239XYZ123456" required />
                </div>
                <div className="space-y-2">
                  <ScreenshotFileField id={`shot-${registrationId}`} value={screenshotUrl} onChange={setScreenshotUrl} />
                </div>
                <Button type="submit" disabled={loading || !canSubmit} className="h-12 w-full rounded-full bg-[#0F172A] text-base font-bold text-white hover:bg-black">
                  {loading ? "Submitting…" : `Submit payment · ₹${amount}`}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Alert className="text-xs bg-blue-50 border-blue-200">
                <Landmark className="h-4 w-4" />
                <AlertTitle className="text-blue-900">Offline payment</AlertTitle>
                <AlertDescription className="text-blue-800">
                  Indicate that you&apos;ve paid offline (cash, cheque, bank transfer, etc.) via your coordinator.
                  Finance will confirm shortly — no screenshot needed. Any problem? Contact Event Coordinator{" "}
                  <a href="tel:+919739431299" className="font-bold underline underline-offset-2">Sam Goldwin · +91 97394 31299</a>.
                </AlertDescription>
              </Alert>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-[#0F172A] text-base font-bold text-white hover:bg-black">
                {loading ? "Submitting…" : "Confirm offline payment"}
              </Button>
            </form>
          )}

          <p className="mt-6 rounded-xl bg-[#F8FAFC] px-4 py-3 text-center text-xs leading-relaxed text-[#0F172A]/60">
            If there is any problem with the payment, contact the Event Coordinator{" "}
            <a href="tel:+919739431299" className="font-bold text-[#0F172A] underline decoration-[#0F172A]/20 underline-offset-2 hover:text-black">
              Sam Goldwin · +91 97394 31299
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PayRegistrationButton({ registrationId, amount }: { registrationId: string; amount: number }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="rounded-full bg-[#0F172A] text-white hover:bg-black">
        Pay ₹{amount}
      </Button>
      <PaySheet open={open} onOpenChange={setOpen} registrationId={registrationId} amount={amount} />
    </>
  );
}
