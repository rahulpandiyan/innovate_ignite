"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";

type PayableItem = { label: string; amount: number; registrationId?: string; orderId?: string };

type Summary = {
  unpaidCount: number;
  reviewCount: number;
  unpaidEvents: PayableItem[];
  reviewEvents: PayableItem[];
  unpaidOrderEvents: PayableItem[];
  reviewOrderEvents: PayableItem[];
  totalDue: number;
};

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function PendingPaymentAlert() {
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/me/payment-summary", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data) setSummary(json.data as Summary);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary || (summary.unpaidCount === 0 && summary.reviewCount === 0)) return null;

  const items = [...summary.unpaidOrderEvents, ...summary.unpaidEvents];
  const [first] = items;
  const ctaHref = first?.orderId ? "/dashboard/orders" : "/dashboard/registrations";

  return (
    <div className="space-y-3">
      {summary.unpaidCount > 0 && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-amber-400/50 bg-amber-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-heading text-base font-bold leading-tight text-amber-900">
                Heads up — {plural(summary.unpaidCount, "payment")} still pending
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                {summary.unpaidCount === 1 && first ? (
                  <>
                    You haven&apos;t paid for{" "}
                    <span className="font-semibold">{first.label}</span> yet
                    {summary.totalDue > 0 && (
                      <>
                        {" "}
                        — <span className="font-mono font-semibold">₹{summary.totalDue.toLocaleString("en-IN")}</span> due
                      </>
                    )}
                    . Complete it now so your spot is confirmed.
                  </>
                ) : (
                  <>
                    You have unpaid registrations worth{" "}
                    <span className="font-mono font-semibold">
                      ₹{summary.totalDue.toLocaleString("en-IN")}
                    </span>
                    . Pay before the deadline to keep your spot.
                  </>
                )}
              </p>
              {items.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {items.slice(0, 4).map((item, idx) => (
                    <li
                      key={`${item.registrationId ?? item.orderId ?? idx}`}
                      className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-500/30"
                    >
                      {item.label}
                    </li>
                  ))}
                  {items.length > 4 && (
                    <li className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-amber-900/80 ring-1 ring-amber-500/30">
                      +{items.length - 4} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <Button asChild className="shrink-0 bg-amber-600 hover:bg-amber-700">
            <Link href={ctaHref}>
              Pay now
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {summary.reviewCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-300/50 bg-blue-50 p-4">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-500/20 text-blue-700">
            <Hourglass className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-sm font-bold leading-tight text-blue-900">
              {plural(summary.reviewCount, "payment")} awaiting confirmation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-blue-900/80">
              We&apos;ve received your payment and our finance team is verifying it. You&apos;ll get your
              QR pass shortly — no action needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}