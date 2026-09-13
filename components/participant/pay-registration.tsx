"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PayRegistrationButton({ registrationId, amount }: { registrationId: string; amount: number }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Payment failed");
      toast.success("Payment successful!", { description: "Registration confirmed. QR pass generated." });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handlePay} disabled={loading} className="rounded-full bg-[#0F172A] text-white hover:bg-black">
      {loading ? "Paying…" : `Pay ₹${amount}`}
    </Button>
  );
}
