"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Copy, ExternalLink, ImageOff, Receipt } from "lucide-react";

export type PreviewRow = {
  participant: string;
  email: string;
  phone: string;
  college: string;
  participantId: string;
  events: string;
  amount: number;
  method: string;
  upiId: string | null;
  screenshotUrl: string | null;
  status: string;
  rejectionReason?: string | null;
  extra?: { label: string; value: string }[];
};

const STATUS_STYLE: Record<string, string> = {
  SUCCESS: "bg-green-600/15 text-green-700 border-green-200",
  VERIFIED: "bg-green-600/15 text-green-700 border-green-200",
  COORDINATOR_COLLECTED: "bg-blue-500/15 text-blue-700 border-blue-200",
  PAYMENT_SUBMITTED: "bg-blue-500/15 text-blue-700 border-blue-200",
  PROCESSING: "bg-blue-500/15 text-blue-700 border-blue-200",
  PENDING: "bg-amber-500/15 text-amber-700 border-amber-200",
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-700 border-amber-200",
  FAILED: "bg-red-600/15 text-red-700 border-red-200",
  REJECTED: "bg-red-600/15 text-red-700 border-red-200",
  CANCELLED: "bg-gray-500/15 text-gray-600 border-gray-200",
  REFUNDED: "bg-gray-500/15 text-gray-600 border-gray-200",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5 truncate text-sm">{children}</div>
    </div>
  );
}

export function PaymentPreviewSheet({
  row,
  actions,
}: {
  row: PreviewRow | null;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [imgBroken, setImgBroken] = React.useState(false);

  function show() {
    setImgBroken(false);
    setOpen(true);
  }

  React.useEffect(() => {
    if (!open) setImgBroken(false);
  }, [open]);

  async function copyUtr(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("UPI transaction ID copied");
    } catch {
      toast.error("Could not copy — select the text manually");
    }
  }

  const shot = row?.screenshotUrl ?? null;
  const showImage = Boolean(shot) && !imgBroken;

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
      >
        <Receipt className="h-3 w-3" />
        Preview
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-t p-0 sm:max-w-none"
        >
          {row && (
            <>
              <SheetHeader className="border-b px-5 py-4 pr-12 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-lg">Payment preview</SheetTitle>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLE[row.status] ?? "text-muted-foreground"}
                  >
                    {row.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <SheetDescription className="mt-1">
                  {row.participant} · {row.events}
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
                {/* LEFT — student + payment facts */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                    <Field label="Participant">{row.participant}</Field>
                    <Field label="Participant ID">
                      <span className="font-mono">{row.participantId || "—"}</span>
                    </Field>
                    <Field label="Email">{row.email}</Field>
                    <Field label="Phone">
                      <a href={`tel:${row.phone}`} className="font-mono text-[#2362EC] hover:underline">
                        {row.phone || "—"}
                      </a>
                    </Field>
                    <Field label="College">{row.college || "—"}</Field>
                    <Field label="Event(s)">{row.events || "—"}</Field>
                    <Field label="Amount">
                      <span className="font-mono font-semibold">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </span>
                    </Field>
                    <Field label="Method">{row.method}</Field>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-amber-700">
                      UPI transaction ID (UTR)
                    </p>
                    {row.upiId ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="break-all font-mono text-sm font-semibold text-amber-950">
                          {row.upiId}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-amber-800 hover:bg-amber-200/60"
                          onClick={() => copyUtr(row.upiId as string)}
                          aria-label="Copy UPI transaction ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-amber-800">
                        Not provided — treat this as an offline/cash payment and confirm manually.
                      </p>
                    )}
                  </div>

                  {row.rejectionReason && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <span className="font-semibold">Rejected:</span> {row.rejectionReason}
                    </div>
                  )}

                  {row.extra?.map((e) => (
                    <Field key={e.label} label={e.label}>
                      {e.value || "—"}
                    </Field>
                  ))}
                </div>

                {/* RIGHT — screenshot */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                    Payment screenshot
                  </p>
                  {shot ? (
                    showImage ? (
                      <>
                        <a
                          href={shot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-xl border bg-muted/30"
                        >
                          <Image
                            src={shot}
                            alt={`Payment screenshot for ${row.participant}`}
                            width={900}
                            height={1200}
                            className="h-auto max-h-[46vh] w-full object-contain"
                            onError={() => setImgBroken(true)}
                            unoptimized
                          />
                        </a>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          Tap the image to open full size
                          <ExternalLink className="h-3 w-3" />
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2 rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                        <ImageOff className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          This file could not be previewed inline.
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <a href={shot} target="_blank" rel="noopener noreferrer">
                            Open screenshot
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                      <ImageOff className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        No screenshot uploaded for this payment.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {actions && (
                <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-5 py-4 backdrop-blur">
                  {actions}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}