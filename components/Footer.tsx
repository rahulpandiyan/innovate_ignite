"use client";

import Image from "next/image";
import Link from "next/link";
import insta from "@/public/images/flogo2.png";
import yt from "@/public/images/flogo1.png";
import linkedin from "@/public/images/flogo4.png";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0F172A] text-white">
      {/* ghost wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden leading-none"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        <div
          className="whitespace-nowrap text-center font-black tracking-[-0.04em]"
          style={{ fontSize: "clamp(80px, 18vw, 220px)", color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.08)" }}
        >
          INNOVATE IGNITE
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* top — brand + newsletter */}
        <div className="grid grid-cols-12 gap-8 py-12 lg:py-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19E3A8]" />
              VVIT · Bengaluru · Oct 9–10, 2026
            </div>
            <h3 className="mt-4 max-w-md font-heading text-2xl font-bold leading-tight tracking-tight text-white">
              A campus carnival
              <br />
              <span className="text-[#F3C317]">built by students.</span>
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
              Vijaya Vittala Institute Of Technology presents Innovate Ignite — 10 stages, 6 domains, one campus.
              Code at midnight. Paint at dawn. Dance at dusk.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { href: "https://www.linkedin.com", img: linkedin, alt: "LinkedIn" },
                { href: "https://www.instagram.com", img: insta, alt: "Instagram" },
                { href: "https://www.youtube.com", img: yt, alt: "YouTube" },
              ].map(({ href, img, alt }) => (
                <a
                  key={alt}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={alt}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur transition-colors hover:bg-[#F3C317] hover:border-[#F3C317] group"
                >
                  <Image
                    src={img}
                    alt={alt}
                    width={16}
                    height={16}
                    className="brightness-0 invert opacity-70 group-hover:invert-0 group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/40">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/events" className="text-white/70 hover:text-white transition-colors">Events — 10 stages</Link></li>
              <li><Link href="/gallery" className="text-white/70 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About VVIT</Link></li>
            </ul>
          </div>

          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/40">Fest</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/events?category=TECHNICAL" className="text-white/70 hover:text-white transition-colors">Technical — 2</Link></li>
              <li><Link href="/events?category=DANCE" className="text-white/70 hover:text-white transition-colors">Dance — 1</Link></li>
              <li><Link href="/events?category=GAMING" className="text-white/70 hover:text-white transition-colors">Gaming — BGMI</Link></li>
              <li><Link href="/events?category=GENERAL" className="text-white/70 hover:text-white transition-colors">General — 4</Link></li>
            </ul>
          </div>

          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/40">Visit</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <p className="font-mono text-xs leading-5 text-white/70">
                Vijaya Vittala Institute of Technology
                <br />
                VVIT Campus, Bengaluru
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#2362EC] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">10 EVENTS</span>
                <span className="rounded-full bg-[#F3C317] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-[#0F172A]">MAY 13–15</span>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#0F172A] hover:bg-white/90 transition-colors"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] tracking-wide text-white/40">
            © 2026 VVIT Innovate Ignite · Made by{" "}
            <a href="https://www.linkedin.com/in/rahulpandiyan/" target="_blank" rel="noreferrer" className="text-white/70 hover:text-[#F3C317] transition-colors">
              Rahul
            </a>{" "}
            ×{" "}
            <a href="https://www.linkedin.com/in/samgoldwin/" target="_blank" rel="noreferrer" className="text-white/70 hover:text-[#F3C317] transition-colors">
              Sam
            </a>{" "}
            · No bugs were harmed.
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-white/30">
            <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <span className="h-3 w-px bg-white/10" />
            <Link href="/terms-of-services" className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
