"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  Receipt,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_STYLE,
  paymentStateOf,
} from "@/lib/paymentState";

export type ParticipantDetail = {
  registrationId: string;
  registeredAt: string;
  registrationStatus: string;
  rejectionReason: string | null;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  participantId: string;
  eventName: string;
  eventCategory: string;
  eventVenue: string;
  eventDate: string;
  teamName: string | null;
  teamId: string | null;
  paymentStatus: string | null;
  paymentAmount: string;
  paymentMethod: string;
  transactionId: string | null;
  receiptUrl: string | null;
  initiatedAt: string | null;
  confirmedAt: string | null;
  collectedBy: string;
  verifiedBy: string;
  formResponses: Record<string, unknown> | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-0.5 text-sm break-words">{children}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ParticipantDetailSheet({ row }: { row: ParticipantDetail }) {
  const [open, setOpen] = React.useState(false);
  const state = paymentStateOf(row.paymentStatus, row.registrationStatus);

  const responses = React.useMemo(() => {
    if (!row.formResponses || typeof row.formResponses !== "object") return [];
    return Object.entries(row.formResponses).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    );
  }, [row.formResponses]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
      >
        <UserRound className="h-3 w-3" />
        Details
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto border-t p-0 sm:max-w-none"
        >
          <SheetHeader className="border-b px-5 py-4 pr-12 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-lg">{row.name}</SheetTitle>
              <Badge
                variant="outline"
                className={PAYMENT_STATE_STYLE[state]}
              >
                {PAYMENT_STATE_LABEL[state]}
              </Badge>
              <Badge variant="outline">{row.registrationStatus}</Badge>
            </div>
            <SheetDescription className="mt-1">
              {row.eventName}
              {row.teamName ? ` · Team ${row.teamName}` : ""}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
            <div className="space-y-6">
              <Section title="Participant" icon={UserRound}>
                <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                  <Field label="Name">{row.name || "—"}</Field>
                  <Field label="Participant ID">
                    <span className="font-mono">{row.participantId || "—"}</span>
                  </Field>
                  <Field label="Email">{row.email || "—"}</Field>
                  <Field label="Phone">
                    {row.phone ? (
                      <a href={`tel:${row.phone}`} className="font-mono text-[#2362EC] hover:underline">
                        {row.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Field>
                </div>
                <a
                  href={`tel:${row.phone}`}
                  className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-[#FFFBEB] px-3 py-2.5 hover:bg-white"
                >
                  <Phone className="h-4 w-4 text-[#2362EC]" />
                  <span className="font-mono font-bold">{row.phone || "No phone"}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Tap to call</span>
                </a>
                <a
                  href={`mailto:${row.email}`}
                  className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2.5 hover:bg-[#0F172A]/5"
                >
                  <Mail className="h-4 w-4 text-[#0F172A]/60" />
                  <span className="font-mono text-xs break-all">{row.email || "No email"}</span>
                </a>
                <div className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2.5">
                  <GraduationCap className="h-4 w-4 text-[#0F172A]/60" />
                  <span className="text-sm">{row.collegeName || "—"}</span>
                </div>
              </Section>

              <Section title="Event & registration" icon={CalendarDays}>
                <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                  <Field label="Event">{row.eventName}</Field>
                  <Field label="Category">
                    {row.eventCategory.replace(/_/g, " ")}
                  </Field>
                  <Field label="Venue">{row.eventVenue || "—"}</Field>
                  <Field label="Event date">{row.eventDate || "—"}</Field>
                  <Field label="Registration ID">
                    <span className="font-mono text-xs">{row.registrationId}</span>
                  </Field>
                  <Field label="Registered on">{row.registeredAt}</Field>
                  {row.teamName && (
                    <Field label="Team">
                      <span className="inline-flex items-center gap-1.5">
                        <UsersRound className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.teamName}
                        {row.teamId ? (
                          <span className="font-mono text-xs text-muted-foreground">({row.teamId})</span>
                        ) : null}
                      </span>
                    </Field>
                  )}
                </div>
                {row.rejectionReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span className="font-semibold">Rejected:</span> {row.rejectionReason}
                  </div>
                )}
                {responses.length > 0 && (
                  <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                      Form responses
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {responses.map(([k, v]) => (
                        <Field key={k} label={k.replace(/[_-]/g, " ")}>
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </Field>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="Payment" icon={Receipt}>
                <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                  <Field label="Payment status">
                    <Badge variant="outline" className={PAYMENT_STATE_STYLE[state]}>
                      {row.paymentStatus ? row.paymentStatus.replace(/_/g, " ") : "No payment record"}
                    </Badge>
                  </Field>
                  <Field label="Amount">
                    <span className="font-mono font-semibold">
                      {row.paymentAmount ? `₹${Number(row.paymentAmount).toLocaleString("en-IN")}` : "—"}
                    </span>
                  </Field>
                  <Field label="Method">{row.paymentMethod}</Field>
                  <Field label="Initiated">{row.initiatedAt || "—"}</Field>
                  <Field label="Confirmed">{row.confirmedAt || "—"}</Field>
                  <Field label="Collected by">{row.collectedBy || "—"}</Field>
                  <Field label="Verified by">{row.verifiedBy || "—"}</Field>
                  <div className="col-span-2 min-w-0">
                    <Field label="UPI transaction ID (UTR)">
                      {row.transactionId ? (
                        <span className="break-all font-mono text-sm">{row.transactionId}</span>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </Field>
                  </div>
                </div>

                {row.receiptUrl ? (
                  <a
                    href={row.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2.5 text-sm hover:bg-[#0F172A]/5"
                  >
                    <Hash className="h-4 w-4 text-[#2362EC]" />
                    <span className="text-xs">Open payment receipt</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">No receipt uploaded.</p>
                )}
              </Section>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}