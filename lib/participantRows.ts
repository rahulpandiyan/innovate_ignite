import { format } from "date-fns";
import { displayEventName } from "@/lib/eventDisplay";
import { paymentStateOf } from "@/lib/paymentState";
import type { ParticipantDetail } from "@/components/admin/participant-detail-sheet";

/** Prisma `include` for a participant row. Shared so both panels query alike. */
export const participantInclude = {
  user: {
    select: {
      name: true,
      email: true,
      phone: true,
      collegeName: true,
      participant: { select: { participantId: true } },
    },
  },
  event: { select: { name: true, category: true, venue: true, date: true } },
  team: { select: { name: true, teamId: true } },
  payment: {
    select: {
      status: true,
      amount: true,
      transactionId: true,
      receiptUrl: true,
      initiatedAt: true,
      confirmedAt: true,
      collector: { select: { name: true } },
      verifier: { select: { name: true } },
    },
  },
} as const;

export type ParticipantRow = {
  registrationId: string;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  formResponses: unknown;
  user: {
    name: string;
    email: string;
    phone: string;
    collegeName: string;
    participant: { participantId: string } | null;
  };
  event: { name: string; category: string; venue: string | null; date: Date | null };
  team: { name: string; teamId: string | null } | null;
  payment: {
    status: string;
    amount: unknown;
    transactionId: string | null;
    receiptUrl: string | null;
    initiatedAt: Date | null;
    confirmedAt: Date | null;
    collector: { name: string } | null;
    verifier: { name: string } | null;
  } | null;
};

const d = (v: Date | null | undefined, withTime = true) =>
  v ? format(v, withTime ? "MMM d, yyyy h:mm a" : "MMM d, yyyy") : null;

/** Flatten a registration row into the props the details sheet renders. */
export function toParticipantDetail(r: ParticipantRow): ParticipantDetail {
  return {
    registrationId: r.registrationId,
    registeredAt: format(r.createdAt, "MMM d, yyyy h:mm a"),
    registrationStatus: r.status,
    rejectionReason: r.rejectionReason,
    name: r.user.name,
    email: r.user.email,
    phone: r.user.phone,
    collegeName: r.user.collegeName,
    participantId: r.user.participant?.participantId ?? "",
    eventName: displayEventName(r.event.name, r.formResponses),
    eventCategory: r.event.category,
    eventVenue: r.event.venue ?? "",
    eventDate: d(r.event.date, false) ?? "",
    teamName: r.team?.name ?? null,
    teamId: r.team?.teamId ?? null,
    paymentStatus: r.payment?.status ?? null,
    paymentAmount: r.payment ? String(r.payment.amount) : "",
    paymentMethod: r.payment ? (r.payment.transactionId === "OFFLINE" ? "OFFLINE" : "UPI") : "—",
    transactionId: r.payment?.transactionId ?? null,
    receiptUrl: r.payment?.receiptUrl ?? null,
    initiatedAt: d(r.payment?.initiatedAt),
    confirmedAt: d(r.payment?.confirmedAt),
    collectedBy: r.payment?.collector?.name ?? "",
    verifiedBy: r.payment?.verifier?.name ?? "",
    formResponses: (r.formResponses as Record<string, unknown> | null) ?? null,
  };
}

/** Excel rows for the participants table. */
export function participantExportRows(rows: ParticipantRow[]) {
  return rows.map((r) => {
    const state = paymentStateOf(r.payment?.status, r.status);
    return {
      Registered: format(r.createdAt, "yyyy-MM-dd HH:mm"),
      Participant: r.user.name,
      Email: r.user.email,
      Phone: r.user.phone,
      College: r.user.collegeName,
      ParticipantID: r.user.participant?.participantId ?? "",
      Event: displayEventName(r.event.name, r.formResponses),
      Team: r.team?.name ?? "",
      Amount: r.payment ? Number(r.payment.amount) : 0,
      PaymentStatus: r.payment?.status ?? "",
      PaymentApproved: state === "APPROVED" ? "Yes" : "No",
      UTR: r.payment?.transactionId ?? "",
      RegistrationStatus: r.status,
      RegistrationID: r.registrationId,
    };
  });
}