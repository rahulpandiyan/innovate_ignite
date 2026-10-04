"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";

export const BROCHURE_URL = "/brochure/innovate-ignite-26-brochure.pdf";
const BROCHURE_FILE = "Innovate Ignite 26 Brochure.pdf";

export function BrochureSheet({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-[#0F172A]/15 bg-white px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#0F172A] hover:bg-white"
          >
            <FileText className="h-3 w-3" />
            See line-up
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex h-[92vh] flex-col gap-0 p-0 sm:h-[92vh]"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-[#0F172A]/10 px-5 py-4 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <SheetTitle className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#0F172A]/60">
                Brochure
              </SheetTitle>
              <p className="text-lg font-semibold tracking-tight text-[#0F172A]">
                Innovate Ignite 26
              </p>
              <SheetDescription className="text-xs text-[#0F172A]/60">
                Full event line-up, rules and pricing.
              </SheetDescription>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={BROCHURE_URL} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
              <Button asChild size="sm">
                <a href={BROCHURE_URL} download={BROCHURE_FILE}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Some mobile browsers refuse to render inline PDFs, so the fallback
            stays reachable instead of showing an empty frame. */}
        <div className="min-h-0 flex-1 bg-[#0F172A]/5">
          <iframe
            src={BROCHURE_URL}
            title="Innovate Ignite 26 Brochure"
            className="h-full w-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}