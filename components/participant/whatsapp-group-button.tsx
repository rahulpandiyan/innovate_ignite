"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppJoinDialog } from "@/components/participant/whatsapp-join-dialog";

export function WhatsAppGroupButton({ eventName }: { eventName: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#25D366] text-white hover:bg-[#1fc457]"
      >
        Join WhatsApp group
      </Button>
      <WhatsAppJoinDialog
        open={open}
        onOpenChange={setOpen}
        title={`Payment verified for ${eventName}! 🎉`}
        description="Finance has verified your payment. Join the WhatsApp group for real-time event updates, schedule changes, and coordinator announcements."
      />
    </>
  );
}
