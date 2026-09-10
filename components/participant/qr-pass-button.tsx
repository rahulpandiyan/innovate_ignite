"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QrPassModal, type QrPassData } from "./qr-pass-modal";

export function QrPassButton({ data }: { data: QrPassData }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <QrCode className="mr-1 h-4 w-4" /> Pass
      </Button>
      <QrPassModal pass={open ? data : null} onClose={() => setOpen(false)} />
    </>
  );
}