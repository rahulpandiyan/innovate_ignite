"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Users, Phone, MapPin, Calendar, Banknote, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { EventCategory } from "@/data/eventCategories";
import { EventList } from "@/data/eventList";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  category: EventCategory;
  details: EventList[];
}

const getCategoryStyle = (category: string) => {
  const map: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    TECHNICAL: { bg: "bg-[#2362EC]", text: "text-[#2362EC]", dot: "bg-[#2362EC]", border: "border-[#2362EC]/20" },
    DANCE: { bg: "bg-[#F3C317]", text: "text-[#0F172A]", dot: "bg-[#F3C317]", border: "border-[#F3C317]/30" },
    GAMING: { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-[#E11D48]", border: "border-[#0F172A]" },
    THEATRE: { bg: "bg-[#E11D48]", text: "text-[#E11D48]", dot: "bg-[#E11D48]", border: "border-[#E11D48]/20" },
    FINE_ARTS: { bg: "bg-[#19E3A8]", text: "text-[#0F172A]", dot: "bg-[#19E3A8]", border: "border-[#19E3A8]/30" },
    GENERAL: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]/70", dot: "bg-[#0F172A]/30", border: "border-[#0F172A]/10" },
    GENERAL_EVENTS: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]/70", dot: "bg-[#0F172A]/30", border: "border-[#0F172A]/10" },
  };
  return map[category] || { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-[#0F172A]", border: "border-[#0F172A]/10" };
};

export default function EventDetailClient({ category, details }: Props) {
  const style = getCategoryStyle(category.category);
  const mainDetail = details[0] || null;
  const [open, setOpen] = useState<string>("guidelines");
  const [dbEvent, setDbEvent] = useState<any>(null);
  const [registering, setRegistering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    async function fetchDbEvent() {
      try {
        const res = await axios.get("/api/events");
        const events = res.data?.data?.events || res.data?.events || [];
        const match = events.find((e: any) => e.name === category.eventName);
        if (match) setDbEvent(match);
      } catch {}
    }
    fetchDbEvent();
  }, [category.eventName]);

  const coordinatorsFromDb: { name: string; mobile?: string }[] =
    dbEvent?.coordinators?.map((c: any) => ({ name: c.user.name, mobile: "" })) || [];

  const handleRegister = () => {
    if (!dbEvent?.id) {
      toast.error("Event not ready. Please refresh.");
      return;
    }
    if (!isLoggedIn) {
      router.push(`/auth/signup?eventId=${dbEvent.id}`);
      return;
    }
    setShowConfirm(true);
  };

  const confirmRegister = async () => {
    if (!dbEvent?.id) return;
    setRegistering(true);
    try {
      const res = await axios.post(`/api/events/${dbEvent.id}/register`);
      if (res.data.success) {
        const isPaid = res.data.data?.isPaidEvent;
        if (isPaid) {
          toast.success("Registered — payment pending", { description: `You are registered for ${category.eventName}. Complete payment in dashboard to confirm.` });
        } else {
          toast.success("Registered!", { description: `You are registered for ${category.eventName}.` });
        }
        setShowConfirm(false);
        router.push("/dashboard/registrations");
      } else {
        toast.error(res.data.error?.message || "Could not register");
      }
    } catch (e: any) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const msg = e.response?.data?.error?.message || e.response?.data?.message;
        if (status === 401) {
          toast.error("Please sign in");
          router.push(`/auth/signin?eventId=${dbEvent.id}`);
          return;
        }
        if (status === 409) {
          toast.error(msg || "Already registered");
          setShowConfirm(false);
          router.push("/dashboard/registrations");
          return;
        }
        toast.error(msg || "Registration failed");
      } else toast.error("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-20 md:pb-0">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link href="/events" className="inline-flex items-center gap-2 text-[#0F172A]/60 hover:text-[#0F172A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to lineup
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 text-[#0F172A]/40">VVIT · Oct 9–10 · Bengaluru</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white shadow-sm">
          <div className={`h-1.5 w-full ${style.bg}`} />
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-8 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${style.bg} ${style.text} ${style.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {category.category.replace(/_/g, " ")}
                </span>
                <span className="rounded-full border border-[#0F172A]/10 bg-[#0F172A]/5 px-2.5 py-1 font-mono text-[10px] tracking-wide">
                  {category.maxParticipant > 1 ? `Team · up to ${category.maxParticipant}` : "Solo"}
                </span>
                <span className="rounded-full bg-[#0F172A] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">
                  #{String(category.eventNo).padStart(2, "0")}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black leading-[0.9] tracking-tight sm:text-4xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {category.eventName}
              </h1>
              <p className="mt-2 font-mono text-xs tracking-wide text-[#0F172A]/50">Part of {category.category.replace(/_/g, " ")} · VVIT Innovate Ignite &apos;26</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3C317] px-3 py-1.5 font-mono text-xs font-bold text-[#0F172A]">
                  <Banknote className="h-3.5 w-3.5" /> {category.amount ? `₹${category.amount}` : "Free"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 font-mono text-xs">
                  <Users className="h-3.5 w-3.5" /> {category.maxParticipant} max
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 font-mono text-xs">
                  <Calendar className="h-3.5 w-3.5" /> Oct 9–10
                </span>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#0F172A]/10 bg-[#0F172A]/[0.02] p-6">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/40">At a glance</p>
              <div className="mt-3 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[#0F172A]/60"><MapPin className="h-3.5 w-3.5" /> Venue</span>
                  <span className="font-bold text-[#0F172A]">VVIT Campus</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[#0F172A]/60"><ShieldCheck className="h-3.5 w-3.5" /> Registration</span>
                  <span className="font-bold text-[#19E3A8]">Open</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {registering ? "Registering…" : "Register now"}
              </button>
              <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/40">Adds to cart → checkout in dashboard</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6 pb-16">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white">
              <button onClick={() => setOpen(open === "guidelines" ? "" : "guidelines")} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="font-heading text-sm font-bold tracking-wide">Guidelines & Rules</span>
                <ChevronDown className={`h-4 w-4 text-[#0F172A]/40 transition-transform ${open === "guidelines" ? "rotate-180" : ""}`} />
              </button>
              {open === "guidelines" && (
                <div className="border-t border-[#0F172A]/10 px-5 py-5">
                  {mainDetail ? (
                    <ol className="list-decimal space-y-2 pl-5 font-body text-sm leading-6 text-[#0F172A]/80">
                      {mainDetail.rules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="font-mono text-sm text-[#0F172A]/60">Detailed rules will be announced shortly.</p>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white">
              <button onClick={() => setOpen(open === "coords" ? "" : "coords")} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="font-heading text-sm font-bold tracking-wide">Coordinators {dbEvent?.coordinators?.length ? `· ${dbEvent.coordinators.length} assigned` : ""}</span>
                <ChevronDown className={`h-4 w-4 text-[#0F172A]/40 transition-transform ${open === "coords" ? "rotate-180" : ""}`} />
              </button>
              {open === "coords" && (
                <div className="border-t border-[#0F172A]/10 p-5">
                  {/* DB coordinators first (live from admin panel) */}
                  {coordinatorsFromDb.length > 0 ? (
                    <div className="mb-4">
                      <p className="mb-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">Assigned via admin panel (live)</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {coordinatorsFromDb.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 rounded-xl border border-[#2362EC]/20 bg-[#EFF6FF] p-3">
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${style.bg}`}>
                              <Users className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-bold leading-none">{c.name}</span>
                              <span className="mt-1 font-mono text-xs text-[#0F172A]/60">Coordinator</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Static sheet data as fallback */}
                  {mainDetail && (mainDetail.coordinator || (mainDetail.coordinators && mainDetail.coordinators.length)) ? (
                    <div>
                      {coordinatorsFromDb.length > 0 && <p className="mb-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">Sheet contacts</p>}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {mainDetail.coordinator && (
                          <a href={`tel:${mainDetail.coordinator.mobile.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-xl border border-[#0F172A]/10 bg-[#FFFBEB] p-3 hover:bg-white transition-colors">
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${style.bg}`}>
                              <Users className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-bold leading-none">{mainDetail.coordinator.name}</span>
                              <span className="mt-1 flex items-center gap-1 font-mono text-xs text-[#2362EC]"><Phone className="h-3 w-3" /> {mainDetail.coordinator.mobile}</span>
                            </span>
                          </a>
                        )}
                        {mainDetail.coordinators?.map((c, idx) => (
                          <a key={idx} href={c.mobile ? `tel:${c.mobile.replace(/\s/g, "")}` : undefined} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${c.mobile ? "border-[#0F172A]/10 bg-[#FFFBEB] hover:bg-white" : "border-dashed border-[#0F172A]/15 bg-white"}`}>
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${c.mobile ? style.bg : "bg-[#0F172A]/20"}`}>
                              <Users className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-bold leading-none">{c.name}</span>
                              {c.mobile ? (
                                <span className="mt-1 flex items-center gap-1 font-mono text-xs text-[#2362EC]"><Phone className="h-3 w-3" /> {c.mobile}</span>
                              ) : (
                                <span className="mt-1 font-mono text-xs text-[#0F172A]/40">Contact via faculty</span>
                              )}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : coordinatorsFromDb.length === 0 ? (
                    <p className="font-mono text-sm text-[#0F172A]/50">Coordinator info pending — check event poster or contact VVIT SPOC.</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white">
              <div className="p-5">
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/40">Venue</p>
                <h3 className="mt-1 font-heading text-base font-bold">Vijaya Vittala Institute of Technology</h3>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-[#0F172A]/60">
                  <MapPin className="h-3.5 w-3.5" /> VVIT Campus, Bengaluru — 13.07687, 77.665938
                </p>
              </div>
              <div className="overflow-hidden border-t border-[#0F172A]/10">
                <iframe
                  title="VVIT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5!2d77.6659382!3d13.0768697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae175698c94741%3A0xd4c7cb9f6754d302!2sVijaya%20Vittala%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="260"
                  className="w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-wrap gap-2 p-4">
                <a href="https://www.google.com/maps/place/Vijaya+Vittala+Institute+of+Technology/@13.07687,77.665938,25956m/data=!3m1!1e3!4m6!3m5!1s0x3bae175698c94741:0xd4c7cb9f6754d302!8m2!3d13.0768697!4d77.6659382!16s%2Fg%2F11j8k7gv6r?hl=en" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#0F172A] px-4 py-2 text-xs font-bold text-white hover:bg-black">
                  Open in Maps <MapPin className="h-3.5 w-3.5" />
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=13.0768697,77.6659382`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-4 py-2 text-xs font-bold hover:bg-[#0F172A]/5">
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-xl tracking-tight">
              Confirm registration?
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              You will be registered for <strong>{category.eventName}</strong> ({category.category.replace(/_/g, " ")}) — {category.amount ? `₹${category.amount}` : "Free"}.
              {category.amount ? " Registration will show as pending until payment is completed in dashboard." : " Free event — registration is immediate."}
              {category.maxParticipant > 1 ? " You can form your team later in dashboard." : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-full">Cancel</Button>
            <Button onClick={confirmRegister} disabled={registering} className="rounded-full bg-[#0F172A] text-white hover:bg-black">
              {registering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…</> : "Confirm & Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
