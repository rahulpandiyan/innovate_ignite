import { z } from "zod";

export const submitPaymentSchema = z
  .object({
    paymentMethod: z.enum(["upi", "offline"]).default("upi"),
    upiTransactionId: z.string().optional(),
    paymentScreenshotUrl: z.string().optional(),
  })
  .refine(
    (d) => d.paymentMethod !== "upi" || (d.upiTransactionId && d.upiTransactionId.length > 0),
    { message: "UPI transaction ID is required for UPI payments" }
  )
  .refine(
    (d) => d.paymentMethod !== "upi" || (d.paymentScreenshotUrl && d.paymentScreenshotUrl.length > 0),
    { message: "Screenshot is required for UPI payments" }
  );

export const verifyPaymentSchema = z.object({
  // No extra fields needed — action is implicit via the route
});

export const rejectPaymentSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});
