import Link from "next/link";
import { ArrowLeft, ShieldCheck, Users, CreditCard, MapPin, Clock, Gavel } from "lucide-react";

export const metadata = {
  title: "Rules & Regulations — Innovate Ignite '26",
};

const sections = [
  {
    icon: Users,
    title: "1. Eligibility",
    items: [
      "Open to all regularly enrolled undergraduate students from VVIT and other colleges/institutions.",
      "A valid college ID is mandatory at the venue.",
      "Participants must be within the team size limits published for each event.",
    ],
  },
  {
    icon: CreditCard,
    title: "2. Registration & Payment",
    items: [
      "Registrations close Oct 6, 2026 · 11:59 PM.",
      "One registration per person per event. Team leader registers for the whole team.",
      "Complete payment on the dashboard; finance verifies and your status becomes CONFIRMED. QR passes generate only after confirmation.",
      "Fees are non-refundable after verification unless the event is cancelled by the organizers.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "3. Conduct & Discipline",
    items: [
      "Maintain decorum. Vulgar, discriminatory, hateful or explicit content is prohibited in any form.",
      "Follow coordinator instructions. Misconduct, plagiarism, false information or rule violations may lead to disqualification.",
      "No AI generation or heavy image manipulation where prohibited (e.g., Photography, Reel).",
    ],
  },
  {
    icon: MapPin,
    title: "4. Venue & Schedule",
    items: [
      "Fest runs Oct 8–9, 2026 at VVIT Campus, Bengaluru.",
      "Venue and time for each event are fixed — check the Schedule before you register to avoid clashes.",
      "Report at least 15–30 minutes before your slot. Latecomers may be disqualified.",
    ],
  },
  {
    icon: Clock,
    title: "5. On-the-Day Rules",
    items: [
      "Bring your college ID, required equipment (laptops, chargers, instruments, costumes) and tracks on a pen drive where required.",
      "Internet, phones or external assistance may not be used unless the coordinator permits.",
      "For on-the-spot creations (Reel, Photography), all work must be done during event hours on campus.",
    ],
  },
  {
    icon: Gavel,
    title: "6. Judging & Decisions",
    items: [
      "Judging criteria are published per event. Judges' decision is final and binding.",
      "Scores and winners will be announced per event. Prizes are distributed on the spot where applicable.",
      "Any dispute should be raised with the event faculty coordinator. The organizing committee's decision is final.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-20 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0F172A]/60 hover:text-[#0F172A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 text-[#0F172A]/40">VVIT · Oct 8–9 · Bengaluru</span>
        </div>

        <div className="text-center">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#0F172A]/50">Please read before you register</p>
          <h1 className="mt-2 text-[clamp(36px,7vw,72px)] font-black leading-[0.9] tracking-tight">RULES &<br />REGULATIONS</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#0F172A]/60">
            These overall rules apply to all 13 stages. Each event page lists its own detailed rules as well.
          </p>
        </div>

        <div className="mt-8 space-y-4 pb-16">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0F172A] text-white">
                  <s.icon className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold tracking-tight">{s.title}</h2>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#0F172A]/75">
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            By registering you agree to these rules and the specific rules on each event&apos;s page. For questions, contact <a href="tel:+919739431299" className="font-bold underline">Sam Goldwin — +91 97394 31299</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
