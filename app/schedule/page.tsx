"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, UserCheck, Camera } from "lucide-react";
import { festSchedule, ScheduleItem } from "@/data/schedule";

const CATEGORY_STYLE: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  TECHNICAL: { bg: "bg-[#2362EC]", text: "text-[#2362EC]", dot: "bg-[#2362EC]", border: "border-[#2362EC]/20" },
  DANCE: { bg: "bg-[#F3C317]", text: "text-[#0F172A]", dot: "bg-[#F3C317]", border: "border-[#F3C317]/30" },
  GAMING: { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-[#E11D48]", border: "border-[#0F172A]" },
  THEATRE: { bg: "bg-[#E11D48]", text: "text-[#E11D48]", dot: "bg-[#E11D48]", border: "border-[#E11D48]/20" },
  GENERAL: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]/70", dot: "bg-[#0F172A]/30", border: "border-[#0F172A]/10" },
};

const catStyle = (category: string) =>
  CATEGORY_STYLE[category] ?? { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-[#0F172A]", border: "border-[#0F172A]/10" };

function EventCard({ item, time, index }: { item: ScheduleItem; time: string; index: number }) {
  const style = catStyle(item.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`/events/${item.slug}`}
        className="group relative flex h-full flex-col rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${style.bg} ${style.text} ${style.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0F172A]/5 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-[#0F172A]/70">
            <Clock className="h-3 w-3" /> {time}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold leading-tight tracking-tight group-hover:text-[#2362EC]">
          {item.name}
        </h3>
        <div className="mt-3 space-y-1.5 font-mono text-xs text-[#0F172A]/60">
          <p className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 shrink-0" /> {item.faculty}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {item.venue}
          </p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs tracking-wide text-[#0F172A]/50 group-hover:text-[#2362EC]">
          Rules, fee & coordinators <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(0);
  const day = festSchedule[activeDay];
  const totalEvents = festSchedule.reduce(
    (n, d) => n + d.slots.reduce((m, s) => m + s.items.length, 0) + (d.runsAlongside ? 1 : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0F172A]/60 hover:text-[#0F172A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 text-[#0F172A]/40">VVIT · Oct 8–9 · Bengaluru</span>
        </div>

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#0F172A]/50">
            Innovate Ignite &apos;26 · VVIT Bengaluru
          </p>
          <h1 className="mt-2 text-[clamp(44px,8vw,88px)] font-black leading-[0.9] tracking-tight">
            SCHEDULE
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#0F172A]/60">
            Two days, {totalEvents} stages, Oct 8–9. Tap any event for its rules, fee and coordinators.
          </p>
          <p className="mx-auto mt-2 max-w-xl font-mono text-xs text-[#0F172A]/50">
            Check for clashes before you register — timings here are the coordinators&apos; latest.
          </p>
        </div>

        {/* ── Day tabs ─────────────────────────────────────── */}
        <div className="mt-8 flex justify-center gap-2">
          {festSchedule.map((d, i) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(i)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold tracking-wide transition-colors ${
                activeDay === i
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "border border-[#0F172A]/10 bg-white text-[#0F172A]/70 hover:text-[#0F172A]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {d.day} · {d.short}
            </button>
          ))}
        </div>

        {/* ── Day section ──────────────────────────────────── */}
        <div key={day.day} className="mt-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0F172A] font-mono text-sm font-bold text-white">
              {activeDay + 1}
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{day.day}</h2>
              <p className="font-mono text-xs text-[#0F172A]/50">{day.date} · VVIT Campus</p>
            </div>
          </div>

          {day.slots.map((slot) => (
            <div key={slot.time} className="mt-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3C317] px-3 py-1.5 font-mono text-xs font-bold text-[#0F172A]">
                  <Clock className="h-3.5 w-3.5" /> {slot.time}
                </span>
                <span className="h-px flex-1 bg-[#0F172A]/10" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {slot.items.map((item, i) => (
                  <EventCard key={item.slug} item={item} time={slot.time} index={i} />
                ))}
              </div>
            </div>
          ))}

          {/* ── Runs alongside ─────────────────────────────── */}
          {day.runsAlongside && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#0F172A]/20 bg-white/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/50">
                Runs alongside
              </p>
              <div className="mt-3 max-w-md">
                <EventCard item={day.runsAlongside} time={day.runsAlongside.time} index={0} />
              </div>
            </div>
          )}
        </div>

        {/* ── Browse all ───────────────────────────────────── */}
        <div className="mt-10 flex justify-center pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-6 py-3 text-sm font-bold text-white hover:bg-black"
          >
            <Camera className="h-4 w-4" /> Browse all events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
