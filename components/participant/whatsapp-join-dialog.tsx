"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WHATSAPP_GROUP_URL, WHATSAPP_GROUP_LABEL } from "@/lib/whatsapp";

const WHATSAPP_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";

export function WhatsAppJoinDialog({
  open,
  onOpenChange,
  title = "Join the updates group!",
  description = "Get real-time event updates, coordinator contact info, and schedule changes on WhatsApp.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl text-center">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15">
            <Image
              src={WHATSAPP_ICON}
              alt="WhatsApp"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              unoptimized
            />
          </div>
          <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button
            asChild
            className="w-full sm:w-auto rounded-full bg-[#25D366] text-white hover:bg-[#1fc457]"
          >
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
              Join {WHATSAPP_GROUP_LABEL}
            </a>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-full">
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}