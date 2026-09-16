"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import gatLogo from "@/public/gat-logos/college-logo.png";
import innovateIgniteLogo from "@/public/gat-logos/innovate-ignite.png";
import LoginLogoutButton from "./LoginLogoutButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── FLOATING PILL HEADER ─────────────────────────────── */}
      <header className="fixed top-3 inset-x-3 sm:inset-x-4 z-50 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border px-2 py-2 sm:px-3 transition-all duration-300 ${
            scrolled
              ? "border-[#0F172A]/10 bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
              : "border-[#0F172A]/10 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,23,42,0.08)]"
          }`}
        >
          {/* left — lockup */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 pl-1">
            <Image
              src={gatLogo}
              alt="VVIT"
              width={120}
              height={68}
              className="h-6 w-auto object-contain sm:h-8"
              priority
            />
            <span className="hidden sm:block h-6 w-px bg-[#0F172A]/10" />
            <Image
              src={innovateIgniteLogo}
              alt="Innovate Ignite"
              width={120}
              height={68}
              className="h-7 w-auto object-contain sm:h-8"
              priority
            />
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19E3A8]" />
              OCT 8–9
            </span>
          </Link>

          {/* center — pill nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#0F172A]/5 p-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#0F172A] text-white shadow-sm"
                      : "text-[#0F172A]/70 hover:text-[#0F172A] hover:bg-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* right — actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-1">
            <div className="hidden sm:block">
              <LoginLogoutButton />
            </div>
            {/* mobile toggle */}
            <button
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#0F172A] text-white md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* mobile drawer — card */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto mx-auto mt-3 max-w-6xl overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)] md:hidden"
            >
              <div className="flex flex-col p-2">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        active ? "bg-[#0F172A] text-white" : "text-[#0F172A] hover:bg-[#0F172A]/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-2 border-t border-[#0F172A]/10 p-2">
                  <LoginLogoutButton onNavigate={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE BOTTOM PILL (fest style) ───────────────────── */}
      <nav className="fixed bottom-3 inset-x-3 z-50 flex justify-center md:hidden pb-[env(safe-area-inset-bottom)] pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#0F172A]/10 bg-white/90 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-colors ${
                  active ? "bg-[#0F172A] text-white" : "text-[#0F172A]/60 hover:text-[#0F172A]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="mx-1 h-4 w-px bg-[#0F172A]/10" />
          <span className="rounded-full bg-[#F3C317] px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-[#0F172A]">
            10 EVENTS
          </span>
        </div>
      </nav>
    </>
  );
}
