"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { WHATSAPP_GROUP_URL } from "@/lib/whatsapp";

const WHATSAPP_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";

export function WhatsAppFloatButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 flex flex-col items-end gap-2">
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Join WhatsApp events update group"
        title="Join events update group"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
      >
        <X className="absolute hidden h-5 w-5 group-hover:block" />
        <Image
          src={WHATSAPP_ICON}
          alt="WhatsApp"
          width={28}
          height={28}
          className="h-7 w-7 object-contain group-hover:hidden"
          unoptimized
        />
        <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow group-hover:block">
          Events update group
        </span>
      </a>
    </div>
  );
}