"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin, Sparkles, Music, Code2, Trophy, Palette, Clapperboard, Star, Gamepad2, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { categories } from "@/data/homeData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import innovateLogo from "@/public/gat-logos/innovate-ignite.png";

const totalEvents = categories.reduce((a, c) => a + c.count, 0);

// Fest poster palette — warm paper, ink, VVIT blue/gold + fest pop
export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#0F172A] selection:bg-[#2362EC] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      {/* ── HERO — CAMPUS CARNIVAL POSTER ─────────────────────────── */}
      <section className="relative overflow-hidden pt-20">
        {/* paper texture + confetti */}
        <div className="absolute inset-0 bg-[#FFFBEB]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        {/* tape strips */}
        <div className="absolute left-[6%] top-[88px] hidden lg:block h-6 w-28 rotate-[-8deg] rounded-sm bg-[#F3C317]/80 shadow-sm" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }} />
        <div className="absolute right-[8%] top-[98px] hidden lg:block h-6 w-24 rotate-[9deg] rounded-sm bg-[#2362EC]/15 shadow-sm" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* top rail */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-3 border-y border-[#0F172A]/10 py-3 font-mono text-[11px] tracking-[0.16em] uppercase"
          >
            <span className="inline-flex items-center gap-2">
              <span className="rounded-full bg-[#E11D48] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">LIVE</span>
              VVIT Bengaluru · National level · Inter-collegiate
            </span>
            <span className="inline-flex items-center gap-2 text-[#0F172A]/60">
              <Calendar className="h-3.5 w-3.5" /> May 13–15, 2026
              <span className="hidden sm:inline">· Registrations open → close Nov 10</span>
            </span>
          </motion.div>

          {/* headline collage */}
          <div className="grid grid-cols-12 gap-6 py-8 lg:py-10">
            {/* LEFT — BIG TYPE */}
            <div className="col-span-12 lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 shadow-sm"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#19E3A8]" />
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Vijaya Vittala Institute of Technology presents</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="mt-4 leading-[0.86] tracking-[-0.03em]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="block text-[clamp(54px,10vw,112px)]">INNOVATE</span>
                <span className="block text-[clamp(54px,10vw,112px)] text-[#2362EC]">IGNITE</span>
                <span className="flex items-center gap-3">
                  <span className="text-[clamp(54px,10vw,112px)]" style={{ WebkitTextStroke: "1.6px #0F172A", color: "transparent" }}>
                    &apos;26
                  </span>
                  <span className="hidden sm:inline-flex -rotate-2 rounded-xl bg-[#F3C317] px-3 py-1 font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-[#0F172A] shadow-sm">
                    10 events · 6 stages
                  </span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="mt-4 max-w-xl font-body text-[15px] leading-6 text-[#0F172A]/70"
              >
                Not a conference. A campus carnival — code at midnight, paint at dawn, dance at dusk, BGMI after dark. Pick your stage, bring your crew.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <Button asChild size="lg" className="h-11 rounded-full bg-[#0F172A] px-6 text-white hover:bg-black">
                  <Link href="/events">
                    Grab your pass <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 rounded-full border-[#0F172A]/15 bg-white px-6">
                  <Link href="#lineup">See lineup</Link>
                </Button>
              </motion.div>

              <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-[#0F172A]/60">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> VVIT Campus, Bengaluru</span>
                <span className="h-3 w-px bg-[#0F172A]/10 hidden sm:block" />
                <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> 1000+ students · One ticket, all venues</span>
              </div>
            </div>

            {/* RIGHT — PHOTO STICKER WALL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="col-span-12 lg:col-span-5"
            >
              <div className="relative mx-auto w-full max-w-[520px]">
                {/* main polaroid */}
                <div className="relative rotate-[-1.2deg] rounded-2xl border border-[#0F172A]/10 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                  <div className="overflow-hidden rounded-xl bg-[#0F172A]">
                    <Image src={innovateLogo} alt="Innovate Ignite" className="h-[280px] w-full object-contain bg-white p-6" priority />
                  </div>
                  <div className="flex items-center justify-between px-1 pt-3">
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/60">VVIT · 13—15 MAY</span>
                    <span className="rounded-full bg-[#2362EC] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">10 EVENTS</span>
                  </div>
                  {/* tape */}
                  <div className="absolute -left-3 top-6 h-7 w-20 rotate-[-12deg] rounded-sm bg-[#19E3A8]/90 shadow" />
                  <div className="absolute -right-2 top-10 h-7 w-16 rotate-[10deg] rounded-sm bg-[#F3C317] shadow" />
                </div>

                {/* floating stickers */}
                <div className="absolute -left-2 sm:-left-6 top-10 rotate-[-6deg] rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E11D48] text-white"><Music className="h-3.5 w-3.5" /></span>
                    <span className="font-heading text-xs font-bold tracking-wide">DANCE ELITE</span>
                    <span className="font-mono text-[10px] text-[#0F172A]/60">Main Stage</span>
                  </div>
                </div>
                <div className="absolute -right-1 sm:-right-4 bottom-10 rotate-[5deg] rounded-xl border border-[#0F172A]/10 bg-[#0F172A] px-3 py-2 shadow-md">
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3C317] text-[#0F172A]"><Gamepad2 className="h-4 w-4" /></span>
                    <span className="font-heading text-xs font-bold tracking-wide">BGMI</span>
                    <span className="font-mono text-[10px] text-white/70">E-Sports Arena</span>
                  </div>
                </div>
                <div className="absolute left-1/2 bottom-2 hidden -translate-x-1/2 rotate-[-1deg] rounded-full border border-[#0F172A]/10 bg-white px-4 py-2 shadow sm:flex items-center gap-2">
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase">No fee till you confirm</span>
                  <span className="h-1 w-1 rounded-full bg-[#0F172A]/30" />
                  <span className="font-mono text-[11px]">Edit till Nov 10</span>
                </div>

                {/* handwritten annotation */}
                <div className="absolute -bottom-3 right-6 hidden sm:block rounded-lg bg-[#FFF1A6] px-3 py-1.5 shadow" style={{ fontFamily: "'Caveat', cursive", transform: "rotate(2deg)" }}>
                  <span className="text-sm text-[#0F172A]">Bengaluru&apos;s biggest campus jam →</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* fest ticker */}
          <div className="overflow-hidden rounded-xl border border-[#0F172A]/10 bg-[#0F172A] text-white">
            <div className="flex animate-[marquee_22s_linear_infinite] whitespace-nowrap py-2.5 font-mono text-xs tracking-[0.18em] uppercase">
              <span className="mx-6 inline-flex items-center gap-3">TECHNINJA <span className="text-[#F3C317]">◆</span> VV CARE <span className="text-[#19E3A8]">◆</span> COOKING WITHOUT FIRE <span className="text-[#E11D48]">◆</span> TALENT MANIA <span className="text-[#F3C317]">◆</span> COLLAGE <span className="text-[#19E3A8]">◆</span> ICEBREAKER <span className="text-[#E11D48]">◆</span> DUMB CHARADES <span className="text-[#F3C317]">◆</span> CODE CONFLUX <span className="text-[#19E3A8]">◆</span> DANCE ELITE <span className="text-[#E11D48]">◆</span> BGMI <span className="text-[#F3C317]">◆</span></span>
              <span className="mx-6 inline-flex items-center gap-3" aria-hidden>TECHNINJA <span className="text-[#F3C317]">◆</span> VV CARE <span className="text-[#19E3A8]">◆</span> COOKING WITHOUT FIRE <span className="text-[#E11D48]">◆</span> TALENT MANIA <span className="text-[#F3C317]">◆</span> COLLAGE <span className="text-[#19E3A8]">◆</span> ICEBREAKER <span className="text-[#E11D48]">◆</span> DUMB CHARADES <span className="text-[#F3C317]">◆</span> CODE CONFLUX <span className="text-[#19E3A8]">◆</span> DANCE ELITE <span className="text-[#E11D48]">◆</span> BGMI <span className="text-[#F3C317]">◆</span></span>
            </div>
            <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
          </div>
        </div>
      </section>

      {/* ── LINEUP — STICKER WALL ───────────────────────────────────── */}
      <section id="lineup" className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase">
                <Star className="h-3.5 w-3.5 text-[#F3C317]" /> Lineup — 10 stages
              </div>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight sm:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "-0.02em" }}>
                Pick your stage.
              </h2>
            </div>
            <p className="max-w-md font-body text-sm leading-6 text-[#0F172A]/60">
              6 domains, 10 events. Each sticker peels to reveal venue, team size and price — tap to filter the real list.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const rotations = ["rotate-[-0.6deg]", "rotate-[0.7deg]", "rotate-[-0.4deg]", "rotate-[0.5deg]", "rotate-[-0.8deg]", "rotate-[0.6deg]"];
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.06 }}
                  className={`${rotations[i % rotations.length]} group`}
                >
                  <Link
                    href={`/events?category=${cat.name.toLowerCase()}`}
                    className="relative flex h-full flex-col rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:rotate-[0deg]"
                  >
                    {/* tape */}
                    <div className="absolute -top-2 left-6 h-4 w-12 rotate-[-6deg] rounded-sm bg-white/80 shadow-sm ring-1 ring-black/5" />
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm" style={{ borderColor: cat.accentBorder, background: cat.accentLight, color: cat.accent }}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <Badge variant="outline" className="rounded-full font-mono text-[10px] tracking-widest">
                        {cat.count} {cat.count === 1 ? "event" : "events"}
                      </Badge>
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold tracking-tight">{cat.name}</h3>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      {cat.tags.map((t) => (
                        <span key={t} className="rounded-full bg-[#0F172A]/5 px-2 py-1 font-mono text-[10px] tracking-wide">
                          {t}
                        </span>
                      ))}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs tracking-wide text-[#0F172A]/60 group-hover:text-[#2362EC]">
                      Peel to explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {/* corner dog-ear */}
                    <span className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 rounded-tl-xl bg-[#F3C317]/20" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/events" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase text-[#0F172A]/60 hover:text-[#0F172A]">
              View all 10 events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── VIBE — POSTER TIMETABLE ────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-[#0F172A]/10 bg-[#0F172A] py-10 text-white sm:py-14">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `repeating-linear-gradient(-12deg, #fff 0 1px, transparent 1px 28px)` }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#19E3A8]">Festival timetable</p>
              <h2 className="mt-2 text-3xl font-black leading-none tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                3 DAYS.<br />10 STAGES.<br />
                <span className="text-[#F3C317]">NONSTOP.</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
                Doors 9:00. Every venue published in advance — no last-minute room changes. Final times drop week of May 4.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] tracking-wide text-white/80">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#F3C317]" /> Schedule in preparation
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { day: "DAY 1 — MAY 13", items: ["Techninja", "VV care", "Cooking Without Fire"], dot: "bg-[#19E3A8]" },
                  { day: "DAY 2 — MAY 14", items: ["Talent mania", "Collage", "ICEBREAKER"], dot: "bg-[#F3C317]" },
                  { day: "DAY 3 — MAY 15", items: ["Dumb charades", "Code Conflux", "Dance Elite", "BGMI"], dot: "bg-[#E11D48]" },
                ].map((col) => (
                  <div key={col.day} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <p className="font-mono text-[11px] tracking-[0.16em] text-white/70">{col.day}</p>
                    <div className="mt-3 space-y-2">
                      {col.items.map((t) => (
                        <div key={t} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#0F172A]">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${col.dot}`} /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="font-mono text-xs text-white/70">Get notified when the full timetable is out</span>
                <Button asChild size="sm" className="rounded-full bg-white text-[#0F172A] hover:bg-white/90">
                  <Link href="/events">Browse events now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — CONFETTI ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-[#0F172A]/10 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-[#F3C317]/20 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[#2362EC]/10 blur-2xl" />
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#E11D48]">Registration live — no fee till you confirm</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Your crew. <span className="text-[#2362EC]">Your stage.</span> One pass.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#0F172A]/60">
              Join 1000+ students across 10 events. One portal, one pass, all venues on VVIT campus. Edit your lineup till Nov 10.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-11 rounded-full bg-[#0F172A] px-7 text-white hover:bg-black">
                <Link href="/events">
                  Register now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-full border-[#0F172A]/15 bg-white px-7">
                <Link href="/about">How it works</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2 font-mono text-[11px] tracking-wide text-[#0F172A]/50">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 px-3 py-1"><span className="h-1.5 w-1.5 rounded-full bg-[#19E3A8]" /> Free to browse</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 px-3 py-1"><span className="h-1.5 w-1.5 rounded-full bg-[#F3C317]" /> Pay only on confirm</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 px-3 py-1"><span className="h-1.5 w-1.5 rounded-full bg-[#2362EC]" /> Campus only · May 13–15</span>
            </div>
          </div>
          <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-[#0F172A]/40">
            © 2026 VVIT · Innovate Ignite · Bengaluru — Hand-pasted, digitally.
          </p>
        </div>
      </section>
    </div>
  );
}
