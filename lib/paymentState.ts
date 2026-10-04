// Single source of truth for "is this participant's payment approved?".
// Both the admin participants list and the finance ledger answer that question,
// so the mapping from raw Payment/Registration status to a plain display state
// lives here instead of being re-derived (and drifting) on each page.

import type { Prisma } from "@prisma/client";

export type PaymentState =
  | "APPROVED"
  | "PENDING"
  | "UNPAID"
  | "REJECTED"
  | "REFUNDED"
  | "FAILED";

/** Filter values used in the ?pay= query param. */
export const PAYMENT_FILTERS = [
  { value: "approved", label: "Payment approved" },
  { value: "pending", label: "Payment pending" },
  { value: "unpaid", label: "No payment yet" },
  { value: "failed", label: "Payment failed" },
  { value: "refunded", label: "Refunded" },
] as const;

export const PAYMENT_STATE_LABEL: Record<PaymentState, string> = {
  APPROVED: "Approved",
  PENDING: "Pending",
  UNPAID: "Not paid",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_STATE_STYLE: Record<PaymentState, string> = {
  APPROVED: "bg-green-600/15 text-green-700 border-green-200",
  PENDING: "bg-amber-500/15 text-amber-700 border-amber-200",
  UNPAID: "bg-gray-500/15 text-gray-600 border-gray-200",
  REJECTED: "bg-red-600/15 text-red-700 border-red-200",
  REFUNDED: "bg-gray-500/15 text-gray-600 border-gray-200",
  FAILED: "bg-red-600/15 text-red-700 border-red-200",
};

/**
 * @param paymentStatus Payment.status, or null when the registration has no
 *        Payment row at all (registration created outside a paid checkout).
 * @param registrationStatus Registration.status — a rejected registration
 *        reads as "Rejected" even if a payment row is still sitting pending.
 */
export function paymentStateOf(
  paymentStatus: string | null | undefined,
  registrationStatus?: string | null
): PaymentState {
  if (registrationStatus === "REJECTED") return "REJECTED";
  switch (paymentStatus) {
    case "SUCCESS":
      return "APPROVED";
    case "PENDING":
    case "PROCESSING":
    case "COORDINATOR_COLLECTED":
      return "PENDING";
    case "REFUNDED":
      return "REFUNDED";
    case "FAILED":
    case "CANCELLED":
      return "FAILED";
    default:
      return "UNPAID";
  }
}

/**
 * Prisma filter fragment matching one ?pay= bucket.
 *
 * Deliberately never returns a top-level `OR` — callers spread this next to
 * their own search `OR`, and an `OR` here would silently replace it. The
 * failed bucket nests its disjunction under `AND` for that reason.
 */
export function paymentStateWhere(filter: string): Prisma.RegistrationWhereInput {
  switch (filter) {
    case "approved":
      return { payment: { is: { status: "SUCCESS" } } };
    case "pending":
      return {
        payment: { is: { status: { in: ["PENDING", "PROCESSING", "COORDINATOR_COLLECTED"] } } },
      };
    case "unpaid":
      return { payment: { is: null } };
    case "failed":
      return {
        AND: [
          {
            OR: [
              { payment: { is: { status: { in: ["FAILED", "CANCELLED"] } } } },
              { status: "REJECTED" },
            ],
          },
        ],
      };
    case "refunded":
      return { payment: { is: { status: "REFUNDED" } } };
    default:
      return {};
  }
}