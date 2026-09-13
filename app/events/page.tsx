"use client";

import React, { useState, useMemo } from "react";
import { Search, ArrowRight, Users, Banknote, Sparkles, ChevronRight } from "lucide-react";
import { eventCategories } from "@/data/eventCategories";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const getCategoryStyle = (category: string) => {
  const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    TECHNICAL: { bg: "bg-[#2362EC]/10", text: "text-[#2362EC]", border: "border-[#2362EC]/20", dot: "bg-[#2362EC]" },
    DANCE: { bg: "bg-[#F3C317]/15", text: "text-[#0F172A]", border: "border-[#F3C317]/30", dot: "bg-[#F3C317]" },
    GAMING: { bg: "bg-[#0F172A]", text: "text-white", border: "border-[#0F172A]", dot: "bg-[#E11D48]" },
    THEATRE: { bg: "bg-[#E11D48]/10", text: "text-[#E11D48]", border: "border-[#E11D48]/20", dot: "bg-[#E11D48]" },
    FINE_ARTS: { bg: "bg-[#19E3A8]/15", text: "text-[#0F172A]", border: "border-[#19E3A8]/30", dot: "bg-[#19E3A8]" },
    GENERAL: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]/70", border: "border-[#0F172A]/10", dot: "bg-[#0F172A]/20" },
    GENERAL_EVENTS: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]/70", border: "border-[#0F172A]/10", dot: "bg-[#0F172A]/20" },
  };
  return map[category] || { bg: "bg-white", text: "text-[#0F172A]", border: "border-[#0F172A]/10", dot: "bg-[#0F172A]/20" };
};

export default function EventPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(eventCategories.map((e) => e.category)));
    return ["ALL", ...cats];
  }, []);

  const filteredEvents = useMemo(() => {
    return eventCategories.filter((e) => {
      const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "ALL" || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-20 md:pb-0">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-y border-[#0F172A]/10 py-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.16em] uppercase">
          <span className="inline-flex items-center gap-2 text-[#0F172A]/60">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0F172A]">Events</span>
            <span className="hidden sm:inline-flex ml-2 rounded-full bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">
              {eventCategories.length} STAGES
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#0F172A]/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#19E3A8]" /> Live lineup
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6 py-8 lg:py-10">
          <div className="col-span-12 lg:col-span-6">
            <h1 className="leading-[0.9] tracking-[-0.03em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <span className="block text-[clamp(36px,6vw,64px)]">THE</span>
              <span className="block text-[clamp(36px,6vw,64px)] text-[#2362EC]">LINEUP</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#0F172A]/60">
              10 stages, 6 domains. Every event is team-ready, faculty-backed, and campus-hosted. Find your stage and register.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-6 flex flex-col justify-end gap-4">
            {/* search — pill */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F172A]/40" />
              <input
                type="text"
                placeholder="Search Techninja, BGMI, Dance Elite…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-full border border-[#0F172A]/10 bg-white pl-11 pr-4 text-[16px] sm:text-sm font-medium text-[#0F172A] placeholder:text-[#0F172A]/40 focus:border-[#2362EC]/30 focus:outline-none focus:ring-4 focus:ring-[#2362EC]/10"
              />
            </div>
            {/* category pills — like header nav */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const count = cat === "ALL" ? eventCategories.length : eventCategories.filter((e) => e.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-colors ${
                      isActive
                        ? "bg-[#0F172A] text-white shadow-sm"
                        : "border border-[#0F172A]/10 bg-white text-[#0F172A]/70 hover:bg-white hover:text-[#0F172A]"
                    }`}
                  >
                    {cat.replace(/_/g, " ")}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[#0F172A]/5 text-[#0F172A]/60"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {filteredEvents.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, i) => {
                const style = getCategoryStyle(event.category);
                const rotations = ["rotate-[-0.4deg]", "rotate-[0.5deg]", "rotate-[-0.3deg]", "rotate-[0.6deg]"];
                return (
                  <motion.div
                    key={event.eventNo}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className={`${rotations[i % rotations.length]} group`}
                  >
                    <Link href={`/events/${event.eventNo}`} className="block h-full">
                      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:rotate-[0deg] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                        {/* tape */}
                        <div className="absolute -top-1.5 left-6 h-3 w-10 rotate-[-7deg] rounded-sm bg-white/80 shadow-sm ring-1 ring-black/5" />
                        {/* top meta */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {event.category.replace(/_/g, " ")}
                          </span>
                          <span className="rounded-full bg-[#0F172A]/5 px-2 py-1 font-mono text-[10px] tracking-wide text-[#0F172A]/60">
                            #{String(event.eventNo).padStart(2, "0")}
                          </span>
                        </div>

                        {/* title */}
                        <h3 className="mt-4 font-heading text-xl font-bold leading-tight tracking-tight text-[#0F172A] group-hover:text-[#2362EC] transition-colors">
                          {event.eventName}
                        </h3>

                        {/* team + price */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A]/5 px-2.5 py-1 font-mono text-xs">
                            <Users className="h-3 w-3" />
                            {event.maxParticipant > 1 ? `Team · up to ${event.maxParticipant}` : "Solo"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3C317] px-2.5 py-1 font-mono text-xs font-bold text-[#0F172A]">
                            <Banknote className="h-3 w-3" />
                            {event.amount ? `₹${event.amount}` : "Free"}
                          </span>
                        </div>

                        {/* footer */}
                        <div className="mt-5 flex items-center justify-between border-t border-[#0F172A]/5 pt-4">
                          <span className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-[#0F172A]/50 group-hover:text-[#2362EC] transition-colors">
                            View details <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.16em] uppercase text-[#0F172A]/30">
                            VVIT · Oct 9–10
                          </span>
                        </div>

                        {/* dog ear */}
                        <span className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 rounded-tl-xl bg-[#F3C317]/15" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#0F172A]/15 bg-white py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A]/5">
              <Search className="h-5 w-5 text-[#0F172A]/50" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold">No stages match</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[#0F172A]/60">Try a different search or pick another domain. All 10 stages are live.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("ALL");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white hover:bg-black transition-colors"
            >
              Clear filters <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0F172A]/10 bg-white px-4 py-3 sm:px-6">
          <span className="font-mono text-xs tracking-wide text-[#0F172A]/60">
            Showing {filteredEvents.length} of {eventCategories.length} stages · VVIT Campus · Oct 9–10, 2026
          </span>
          <Link href="/" className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-wide text-[#0F172A] hover:text-[#2362EC]">
            Back to home <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
