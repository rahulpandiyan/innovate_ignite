"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// New campus image (aerial) — replace with provided bio campus
import vvitCampus from "@/public/images/vvit-campus-new.png";

// Credential images
import affiliationImg from "@/components/images/affiliation.png";
import aicteImg from "@/components/images/aicte.png";
import recognizedImg from "@/components/images/recognized.png";

export default function About() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#0F172A] selection:bg-[#2362EC] selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      {/* ── HERO — CAMPUS POSTER ──────────────────────────────── */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[#FFFBEB]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        <div className="absolute left-[6%] top-[88px] hidden lg:block h-6 w-28 rotate-[-7deg] rounded-sm bg-[#F3C317]/80 shadow-sm" />
        <div className="absolute right-[8%] top-[96px] hidden lg:block h-6 w-24 rotate-[8deg] rounded-sm bg-[#19E3A8]/70 shadow-sm" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/60">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19E3A8]" /> VVIT · Bengaluru
            </span>
            <span className="h-3 w-px bg-[#0F172A]/10 hidden sm:block" />
            <span>Est. 1 Jan 2009 · Sri Vijaya Vittala Charitable and Educational Trust</span>
            <span className="hidden sm:inline-flex ml-2 items-center gap-1.5 rounded-full bg-[#0F172A] px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">
              <MapPin className="h-3 w-3" /> 13.07687, 77.665938
            </span>
          </div>

          <div className="mt-6 grid grid-cols-12 gap-8 items-center">
            <div className="col-span-12 lg:col-span-6">
              <h1 className="leading-[0.88] tracking-[-0.03em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="block text-[clamp(42px,7vw,84px)]">ABOUT</span>
                <span className="block text-[clamp(42px,7vw,84px)] text-[#2362EC]">VVIT</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#0F172A]/60">
                A campus where traditions meet ambitious plans — and where every day proves engineering is about discovering which problem to solve first.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-[#0F172A] text-white hover:bg-black">
                  <Link href="/events">
                    Explore Innovate Ignite <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#0F172A]/10 bg-white">
                  <a href="http://www.vvit.ac.in" target="_blank" rel="noreferrer">
                    Visit vvit.ac.in
                  </a>
                </Button>
              </div>
              <div className="mt-6 inline-flex -rotate-1 rounded-xl bg-[#FFF1A6] px-3 py-1.5 shadow" style={{ fontFamily: "'Caveat', cursive" }}>
                <span className="text-sm text-[#0F172A]">10-acre campus · 3,500 students · 300 staff →</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: -1.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="col-span-12 lg:col-span-6"
            >
              <div className="relative mx-auto w-full max-w-[560px] rotate-[-1.2deg] rounded-2xl border border-[#0F172A]/10 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <div className="overflow-hidden rounded-xl">
                  <Image
                    src={vvitCampus}
                    alt="VVIT Campus aerial view"
                    width={1200}
                    height={800}
                    className="h-[320px] w-full object-cover sm:h-[380px]"
                    priority
                  />
                </div>
                <div className="flex items-center justify-between px-1 pt-3">
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/60">VVIT Campus — Bengaluru</span>
                  <span className="rounded-full bg-[#2362EC] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">10 ACRES</span>
                </div>
                <div className="absolute -left-3 top-6 h-7 w-20 rotate-[-12deg] rounded-sm bg-[#19E3A8]/90 shadow" />
                <div className="absolute -right-2 top-10 h-7 w-16 rotate-[10deg] rounded-sm bg-[#F3C317] shadow" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BIO — EDITORIAL ──────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#E11D48]">The bio — as written</p>
              <h2 className="mt-2 text-3xl font-black leading-none tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                ENGINEERING
                <br />
                <span className="text-[#2362EC]">IS DISCOVERY.</span>
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 font-mono text-[11px] tracking-wide text-[#0F172A]/60">
                <Sparkles className="h-3.5 w-3.5 text-[#F3C317]" /> Since 1 Jan 2009
              </div>
              <p className="mt-2 font-mono text-[10px] leading-4 text-[#0F172A]/40">Official accreditation: 1 January 2009 · Sri Vijaya Vittala Charitable and Educational Trust, Bengaluru</p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 sm:p-8 shadow-sm">
                <p className="font-body text-[15px] leading-7 text-[#0F172A]/80">
                  Vijaya Vittala Institute of Technology (VVIT) is an institution dedicated to engineering education, innovation, and the pursuit of excellence. With a strong emphasis on academics, technology, practical learning, and student development, the college strives to provide an environment where ideas can grow and possibilities are endless. VVIT is also known for its commitment to maintaining traditions, following established systems, and ensuring that every student gets the opportunity to experience the timeless art of adapting to whatever the day brings. From ambitious plans and innovative initiatives to wonderfully unexpected changes along the way, VVIT continues to evolve, proving that engineering is not just about solving problems — sometimes, it is about discovering which problem needs to be solved first.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#0F172A]/10 bg-[#FFFBEB] px-4 py-3 text-center">
                    <div className="font-heading text-lg font-black">10 acres</div>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F172A]/50">Campus</div>
                  </div>
                  <div className="rounded-xl border border-[#0F172A]/10 bg-white px-4 py-3 text-center">
                    <div className="font-heading text-lg font-black">3,500+</div>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F172A]/50">Students</div>
                  </div>
                  <div className="rounded-xl border border-[#0F172A]/10 bg-white px-4 py-3 text-center">
                    <div className="font-heading text-lg font-black">300+</div>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F172A]/50">Staff</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-[#0F172A]/50">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#19E3A8]/15 px-2.5 py-1"><Calendar className="h-3 w-3" /> Oct 9–10 · VVIT Campus</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 px-2.5 py-1"><MapPin className="h-3 w-3" /> Bengaluru</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS — STICKER WALL ───────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#0F172A]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#2362EC]">Excellence recognized</p>
              <h2 className="mt-2 font-heading text-3xl font-black tracking-tight sm:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                TRUST, <span className="text-[#2362EC]">VERIFIED.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#0F172A]/60">Affiliated, approved, and recognized — so your 4 years count where it matters.</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { img: affiliationImg, title: "University Affiliation", desc: 'Affiliated with Visvesvaraya Technological University (VTU), Belagavi since 2009. Curriculum meets modern industry standards.' },
              { img: aicteImg, title: "Approved by AICTE", desc: "All programs approved by the All India Council for Technical Education, ensuring adherence to high education standards." },
              { img: recognizedImg, title: "Govt. Recognized", desc: "Programs recognized by the Government of Karnataka, guaranteeing national benchmarks." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative flex flex-col items-center rounded-2xl border border-[#0F172A]/10 bg-[#FFFBEB] p-6 text-center shadow-sm hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all"
              >
                <div className="absolute -top-2 left-6 h-4 w-12 rotate-[-6deg] rounded-sm bg-white/80 shadow-sm ring-1 ring-black/5 hidden sm:block" />
                <div className="flex h-28 items-center justify-center">
                  <Image src={c.img} alt={c.title} width={96} height={96} className="object-contain" />
                </div>
                <h3 className="mt-2 font-heading text-base font-bold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#0F172A]/60">{c.desc}</p>
                <Badge variant="outline" className="mt-4 rounded-full font-mono text-[10px] tracking-widest">Verified</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-[#0F172A]/10 bg-[#0F172A] p-8 text-center text-white sm:p-10">
            <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-[#F3C317]/20 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[#2362EC]/20 blur-2xl" />
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#F3C317]">See it for yourself</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Your campus tour <span className="text-[#19E3A8]">starts here.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
              10 stages, 6 domains, one 10-acre campus. Meet the coordinators, find your venue, and get your pass.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-white px-7 text-[#0F172A] hover:bg-white/90">
                <Link href="/events">
                  Browse 10 stages <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white">
                <a href="http://www.vvit.ac.in" target="_blank" rel="noreferrer">
                  vvit.ac.in
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
