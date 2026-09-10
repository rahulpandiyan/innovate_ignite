"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type QrPassData = {
  qrDataUrl: string;
  eventName: string;
  registrationId: string;
  attendeeId: string;
  token: string;
};

export function QrPassModal({
  pass,
  onClose,
}: {
  pass: QrPassData | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!pass} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        {pass && (
          <>
            <DialogHeader>
              <DialogTitle>Digital pass</DialogTitle>
              <DialogDescription>
                Show this QR at the venue for {pass.eventName}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pass.qrDataUrl}
                alt="QR pass"
                className="h-56 w-56 rounded-lg border bg-white object-contain p-2"
              />
              <div className="flex flex-col items-center gap-2 text-center">
                <Badge variant="secondary">{pass.registrationId}</Badge>
                <p className="text-xs text-muted-foreground">
                  {pass.attendeeId} · scan token {pass.token.slice(0, 16)}…
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}