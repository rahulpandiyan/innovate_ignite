"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Clock, ArrowUpRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { categories } from "@/data/homeData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const totalEvents = categories.reduce((a, c) => a + c.count, 0);

// signature: program index numbers — real data, not decoration
const program = categories.map((c, i) => ({
  n: String(i + 1).padStart(2, "0"),
  ...c,
}));

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* ── HERO — POSTER + PROGRAM INDEX ─────────────────────────────── */}
      <section className="relative border-b border-border">
        {/* hairline top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-border" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-0 lg:gap-6">
            {/* LEFT — POSTER */}
            <div className="col-span-12 lg:col-span-7 pt-28 pb-10 lg:py-16 lg:pr-6">
              {/* eyebrow — real info, mono */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-[0.18em] uppercase text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  Registration open
                </span>
                <span className="h-3 w-px bg-border hidden sm:block" />
                <span>VVIT Bengaluru</span>
                <span className="h-1 w-1 rounded-full bg-border hidden sm:block" />
                <span>May 13–15 · 2026</span>
              </motion.div>

              {/* headline — Playfair + Rajdhani, tight */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display leading-[0.88] tracking-[-0.04em]"
              >
                <span className="block text-[clamp(44px,8vw,84px)] font-black">
                  INNOVATE
                </span>
                <span className="block text-[clamp(44px,8vw,84px)] font-black text-primary">
                  IGNITE
                </span>
                <span className="flex items-baseline gap-3">
                  <span
                    className="font-display text-[clamp(44px,8vw,84px)] font-black"
                    style={{ WebkitTextStroke: "1.4px hsl(var(--border))", color: "transparent" }}
                  >
                    &apos;26
                  </span>
                  <span className="hidden sm:inline-flex font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground border border-border rounded-full px-3 py-1">
                    National level · Inter-collegiate
                  </span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="mt-5 max-w-xl text-[15px] leading-6 text-muted-foreground font-body"
              >
                Three days of theatre, dance, music, fashion, lit and fine arts — staged as a
                single programme. No filler events. Every slot is curated, judged, and published.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <Button asChild size="lg" className="rounded-full px-6 h-11 text-[13px] tracking-wide">
                  <Link href="/events">
                    Explore events <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-6 h-11 text-[13px]">
                  <Link href="#program">View programme</Link>
                </Button>
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground ml-1 hidden sm:inline">
                  {totalEvents} events · {categories.length} domains · 3 days
                </span>
              </motion.div>

              {/* micro-meta — replaces count-up stats with useful facts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                className="mt-8 flex flex-wrap gap-5 border-t border-border pt-5"
              >
                <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> May 13–15, 2026
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> VVIT Campus, Bengaluru
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Registrations close Nov 10
                </span>
              </motion.div>
            </div>

            {/* RIGHT — PROGRAM INDEX (signature) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="col-span-12 lg:col-span-5 lg:py-12"
            >
              <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {/* perforated left edge */}
                <div
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 hidden lg:block"
                  style={{
                    background: `radial-gradient(circle at 0 8px, transparent 7px, hsl(var(--card)) 7.5px)`,
                    backgroundSize: "16px 16px",
                    backgroundRepeat: "repeat-y",
                    marginLeft: "-8px",
                  }}
                  aria-hidden
                />
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-secondary">Programme Index</p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">
                        Every domain, event count, and venue — as printed. Tap to filter.
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase shrink-0">
                      2026
                    </Badge>
                  </div>

                  <Separator className="my-5" />

                  <div className="space-y-1">
                    {program.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.name}
                          href={`/events?category=${cat.name.toLowerCase()}`}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2.5 -mx-2 hover:bg-accent/50 transition-colors"
                        >
                          <span className="font-mono text-[11px] tracking-widest text-muted-foreground w-7">
                            {cat.n}
                          </span>
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-md border text-[13px] shrink-0"
                            style={{ borderColor: cat.accentBorder, color: cat.accent, background: cat.accentLight }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-baseline gap-2">
                              <span className="font-display text-[15px] font-semibold tracking-tight">
                                {cat.name}
                              </span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                — {cat.count}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap gap-1.5">
                              {cat.tags.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </span>
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-lg border border-dashed p-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
                      Full timetable
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">Coming soon · Notify me</span>
                  </div>

                  <p className="mt-4 font-mono text-[10px] leading-4 text-muted-foreground/70">
                    Printed programme · Subject to venue capacity. Final schedule released week of May 4.
                  </p>
                </div>
              </div>

              {/* small stat bar — not count-up, just facts */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-card px-3 py-3 text-center">
                  <div className="font-display text-xl font-bold leading-none">{totalEvents}</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    Events
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-3 text-center">
                  <div className="font-display text-xl font-bold leading-none">3</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">Days</div>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-3 text-center">
                  <div className="font-display text-xl font-bold leading-none">1000+</div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">Participants</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROGRAM — structured rows, not cards ──────────────────────────── */}
      <section id="program" className="py-14 sm:py-16 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-secondary">Programme</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Domains, in order.
              </h2>
            </div>
            <p className="max-w-md font-body text-sm leading-6 text-muted-foreground">
              Seven domains. {totalEvents} events. Each row shows what&apos;s inside — filter by domain to see
              the actual stage.
            </p>
          </div>

          <div className="mt-8 divide-y divide-border border-y border-border overflow-hidden rounded-xl bg-background">
            {program.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                >
                  <Link
                    href={`/events?category=${cat.name.toLowerCase()}`}
                    className="group flex items-center gap-4 px-4 sm:px-6 py-5 hover:bg-muted/40 transition-colors"
                  >
                    <span className="hidden sm:inline font-mono text-xs tracking-widest text-muted-foreground w-8">
                      {cat.n}
                    </span>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-md border shrink-0"
                      style={{ background: cat.accentLight, borderColor: cat.accentBorder, color: cat.accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-display text-[17px] font-semibold tracking-tight">{cat.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {cat.count} events · {cat.tags.join(" · ")}
                        </span>
                      </span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                      Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="sm:hidden text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Link href="/events" className="font-mono text-xs tracking-wide text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all {totalEvents} events <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE — timetable, not ghost text ─────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-secondary">Itinerary</p>
              <h2 className="mt-2 font-display text-3xl font-bold leading-none tracking-tight">
                3 days.
                <br />
                <span className="text-primary">One programme.</span>
              </h2>
              <p className="mt-3 max-w-sm font-body text-sm leading-6 text-muted-foreground">
                Doors 9:00. Every venue published in advance — no last-minute room changes. Full timetable drops
                week of May 4.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Schedule in preparation
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { day: "Day 1", date: "May 13 · Tue", items: ["Theatre prelims", "Dance solos", "Literary heats"], accent: "primary" },
                  { day: "Day 2", date: "May 14 · Wed", items: ["Music & Fashion", "Fine arts live", "Quiz & Cooking"], accent: "secondary" },
                  { day: "Day 3", date: "May 15 · Thu", items: ["Finals", "Showcase", "Valedictory"], accent: "accent" },
                ].map((col) => (
                  <div key={col.day} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold tracking-wide">{col.day}</span>
                      <span className="font-mono text-[11px] tracking-wide text-muted-foreground">{col.date}</span>
                    </div>
                    <Separator className="my-4" />
                    <ul className="space-y-2.5">
                      {col.items.map((t) => (
                        <li key={t} className="flex items-center gap-2 font-body text-sm">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-foreground/90">{t}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 font-mono text-[11px] text-muted-foreground">Venue map → published with schedule</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-dashed bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground">Get notified when the full timetable is out</span>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/events">Browse events now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — ticket stub, not navy radial ───────────────────────────── */}
      <section className="pb-16 pt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* top perforation */}
            <div
              className="absolute inset-x-0 top-0 h-4 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 8px 0, transparent 7px, hsl(var(--border)) 7.5px, hsl(var(--card)) 8px)`,
                backgroundSize: "16px 16px",
                backgroundRepeat: "repeat-x",
                opacity: 0.9,
              }}
              aria-hidden
            />
            <div className="px-6 sm:px-10 py-10 sm:py-12 text-center">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-secondary">Registration live</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-black tracking-tight">
                Bring your best. <span className="text-primary">We&apos;ll bring the stage.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-6 text-muted-foreground">
                Join 1000+ students across {totalEvents} events. One portal, one pass, all venues on campus.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="rounded-full px-7 h-11">
                  <Link href="/events">
                    Register your team <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-7 h-11">
                  <Link href="/about">How it works</Link>
                </Button>
              </div>
              <p className="mt-4 font-mono text-[11px] text-muted-foreground">No fee until you confirm. Edit your lineup until Nov 10.</p>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-muted-foreground">
            © 2026 VVIT · Innovate Ignite · Bengaluru — Printed programme, digitally.
          </p>
        </div>
      </section>
    </div>
  );
}
