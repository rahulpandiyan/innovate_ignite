"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PaySheet } from "@/components/participant/pay-registration";

// Opens the payment bottom sheet automatically when the user arrives via a
// deep link like /dashboard/registrations?pay=<registrationId> (e.g. from
// the finance reminder mail). Closing the sheet clears the query param so
// it doesn't reopen on refresh.
export function AutoPaySheet({
  registrationId,
  amount,
}: {
  registrationId: string;
  amount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const handleChange = (val: boolean) => {
    setOpen(val);
    if (!val) router.replace("/dashboard/registrations");
  };

  return (
    <PaySheet
      open={open}
      onOpenChange={handleChange}
      registrationId={registrationId}
      amount={amount}
      onSubmitted={() => router.replace("/dashboard/registrations")}
    />
  );
}
