"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Phone, Mail, GraduationCap, Hash } from "lucide-react";

type Props = {
  user: { name: string; email: string; phone: string; collegeName: string };
  participantId?: string | null;
  registrationId?: string;
  eventName?: string;
};

export function UserContactDialog({ user, participantId, registrationId, eventName }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Eye className="h-3.5 w-3.5" />
          <span className="sr-only">View contact</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">{user.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {eventName ? `${eventName} · ` : ""}
            {registrationId ?? ""}
          </p>
        </DialogHeader>
        <div className="space-y-3 py-2 text-sm">
          <a href={`tel:${user.phone}`} className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-[#FFFBEB] px-3 py-2.5 hover:bg-white">
            <Phone className="h-4 w-4 text-[#2362EC]" />
            <span className="font-mono font-bold">{user.phone}</span>
            <span className="ml-auto text-xs text-muted-foreground">Tap to call</span>
          </a>
          <a href={`mailto:${user.email}`} className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2.5 hover:bg-[#0F172A]/5">
            <Mail className="h-4 w-4 text-[#0F172A]/60" />
            <span className="font-mono text-xs break-all">{user.email}</span>
          </a>
          <div className="flex items-center gap-2 rounded-lg border border-[#0F172A]/10 bg-white px-3 py-2.5">
            <GraduationCap className="h-4 w-4 text-[#0F172A]/60" />
            <span className="text-sm">{user.collegeName || "—"}</span>
          </div>
          {participantId && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#0F172A]/15 bg-white px-3 py-2.5">
              <Hash className="h-4 w-4 text-[#0F172A]/40" />
              <span className="font-mono text-xs">{participantId}</span>
              <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">Participant ID</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
