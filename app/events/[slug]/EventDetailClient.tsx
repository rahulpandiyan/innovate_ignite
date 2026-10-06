"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Users, Phone, MapPin, Calendar, Clock, Banknote, ShieldCheck, ChevronDown, Loader2, Wallet, CheckCircle2, Ban } from "lucide-react";
import { EventCategory } from "@/data/eventCategories";
import { EventList } from "@/data/eventList";
import type { PublicEventDetail, ViewerEventRegistration } from "@/lib/eventDetail";
import { formatPriceLabel, memberCountLabel, teamSizeOptions, PricingMode, TeamSizeOption } from "@/lib/pricing";
import { paymentStateOf } from "@/lib/paymentState";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsAppJoinDialog } from "@/components/participant/whatsapp-join-dialog";
import { PaySheet } from "@/components/participant/pay-registration";

interface Props {
  category: EventCategory;
  details: EventList[];
  dbEvent: PublicEventDetail | null;
  viewerRegistration: ViewerEventRegistration | null;
}

// What the primary button on the event page should offer the viewer.
type CtaMode = "register" | "pay" | "review" | "done" | "closed";

// DB rules are stored pipe- or newline-delimited; the static sheet uses an array.
const withProfPrefix = (name: string) => (/^prof\.?\s/i.test(name) ? name : `Prof. ${name}`);

function splitDbRules(rules: string): string[] {
  return rules
    .split(/\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "#19E3A8" },
  DRAFT: { label: "Not open yet", color: "#F3C317" },
  REGISTRATION_CLOSED: { label: "Closed", color: "#94a3b8" },
  ONGOING: { label: "Live now", color: "#2362EC" },
  COMPLETED: { label: "Completed", color: "#94a3b8" },
  CANCELLED: { label: "Cancelled", color: "#E11D48" },
};

const getCategoryStyle = (category: string) => {
  const map: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    TECHNICAL: { bg: "bg-[#2362EC]", text: "text-white", dot: "bg-white", border: "border-[#2362EC]/20" },
    DANCE: { bg: "bg-[#F3C317]", text: "text-[#0F172A]", dot: "bg-[#0F172A]", border: "border-[#F3C317]/30" },
    GAMING: { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-[#E11D48]", border: "border-[#0F172A]" },
    THEATRE: { bg: "bg-[#E11D48]", text: "text-white", dot: "bg-white", border: "border-[#E11D48]/20" },
    FINE_ARTS: { bg: "bg-[#19E3A8]", text: "text-[#0F172A]", dot: "bg-[#0F172A]", border: "border-[#19E3A8]/30" },
    GENERAL: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]", dot: "bg-[#0F172A]/40", border: "border-[#0F172A]/10" },
    GENERAL_EVENTS: { bg: "bg-[#FFFBEB]", text: "text-[#0F172A]", dot: "bg-[#0F172A]/40", border: "border-[#0F172A]/10" },
  };
  return map[category] || { bg: "bg-[#0F172A]", text: "text-white", dot: "bg-white", border: "border-[#0F172A]/10" };
};

const LATENT_QUESTIONS = [
  "If you woke up with a superpower for one day, what would it be?",
  "If you could have any nickname without worrying about being judged or teased, what would it be?",
  "What is the weirdest encounter you have ever had with a stranger?",
  "What is the weirdest character you would choose to replace yourself with for a day?",
  "What is the funniest story from your childhood or your most recent funny experience?",
  "Tell us an interesting or unusual fact about yourself.",
  "What is the best aspect of your personality that you admire the most?",
  "Describe your “latent” — the hidden talent, trait, or weirdness that people don't usually notice about you.",
  "Why do you think you should be selected for VVIT Got Latent?",
];

export default function EventDetailClient({ category, details, dbEvent, viewerRegistration }: Props) {
  const style = getCategoryStyle(category.category);
  const mainDetail = details[0] || null;
  const [open, setOpen] = useState<string>("guidelines");
  const [registering, setRegistering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(category.minTeamSize);
  const [latentAnswers, setLatentAnswers] = useState<Record<number, string>>({});
  const isLatent = category.eventName === "VVIT GOT LATENT";
  const latentComplete = LATENT_QUESTIONS.every((_, i) => (latentAnswers[i] ?? "").trim().length > 0);
  const isGaming = category.eventName === "BGMI & FreeFire";
  const [selectedGame, setSelectedGame] = useState<"BGMI" | "Free Fire">("BGMI");
  const [payInfo, setPayInfo] = useState<{ registrationId: string; amount: number; stayOnPage: boolean } | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  // Server prop is the baseline; the local override lets registering/paying
  // on this page move the button immediately (router.refresh() agrees with it).
  const [regOverride, setRegOverride] = useState<ViewerEventRegistration | null>(null);
  const viewerReg = regOverride ?? viewerRegistration;

  // DB is the source of truth at render time; static sheet data is the fallback.
  const eventName = dbEvent?.name || category.eventName;
  const priceMode = (dbEvent?.priceMode as PricingMode) || category.priceMode;
  const price = dbEvent?.price != null ? Number(dbEvent.price) : category.price;
  const groupPrice = dbEvent?.groupPrice != null ? Number(dbEvent.groupPrice) : category.groupPrice;
  const minTeamSize = dbEvent?.minTeamSize ?? category.minTeamSize;
  const maxTeamSize = dbEvent?.maxTeamSize ?? category.maxTeamSize;
  const isSoloOnly = minTeamSize === 1 && maxTeamSize === 1 && priceMode !== "SOLO_OR_GROUP";
  const venue = dbEvent?.venue?.trim() ? dbEvent.venue : "VVIT Campus";
  const statusInfo = STATUS_LABELS[dbEvent?.status ?? "OPEN"] ?? STATUS_LABELS.OPEN;
  const registrationsOpen = !dbEvent || dbEvent.status === "OPEN";
  const eventDate = dbEvent?.date ? new Date(dbEvent.date) : null;
  const dateLabel =
    eventDate && !isNaN(eventDate.getTime())
      ? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Oct 13–14";

  const dbRules = dbEvent?.rules ? splitDbRules(dbEvent.rules) : [];
  const rules = (dbRules.length ? dbRules : mainDetail?.rules) as string[] | undefined;
  const showAbout =
    !!dbEvent?.description?.trim() && dbEvent.description.trim() !== (dbEvent.rules ?? "").trim();

  const sizeOptions: TeamSizeOption[] = teamSizeOptions({ price, priceMode, minTeamSize, maxTeamSize, groupPrice });
  const selectedOption = sizeOptions.find((o) => o.value === selectedSize) ?? sizeOptions[0];

  // Already-registered viewers get a Pay button (instead of Register) while
  // money is still owed; submitted-but-unverified payments stop at "in review".
  const payState = viewerReg ? paymentStateOf(viewerReg.paymentStatus, viewerReg.status) : null;
  const amountDue = Number(viewerReg?.price ?? 0);
  const payTarget =
    viewerReg && viewerReg.needsPayment && amountDue > 0
      ? { registrationId: viewerReg.id, amount: amountDue }
      : null;
  const ctaMode: CtaMode = !viewerReg
    ? "register"
    : payState === "APPROVED" || viewerReg.status === "CONFIRMED"
      ? "done"
      : payState === "PENDING"
        ? "review"
        : viewerReg.status === "REJECTED"
          ? "closed"
          : payTarget
            ? "pay"
            : "done";

  // Coordinator contacts are managed in the admin / coordinator panels
  // (EventCoordinatorContact) and shown here as staff vs student groups.
  const contactList = dbEvent?.coordinatorContacts ?? [];
  const contactsStaff = contactList.filter((c) => c.isStaff);
  const contactsStudents = contactList.filter((c) => !c.isStaff);

  // Paying straight from an already-registered event page keeps the viewer
  // here (button flips to "in review"); paying right after registering still
  // drops them back on the lineup like before.
  const closePaySheet = (submitted: boolean) => {
    const stay = payInfo?.stayOnPage ?? false;
    setPayInfo(null);
    if (!stay) {
      router.push("/events");
      return;
    }
    if (submitted && viewerReg) {
      setRegOverride({ ...viewerReg, paymentStatus: "PENDING", needsPayment: false });
    }
  };

  const handleRegister = () => {
    if (!dbEvent?.id) {
      toast.error("Event not ready. Please refresh.");
      return;
    }
    if (!isLoggedIn) {
      router.push(`/auth/signup?eventId=${dbEvent.id}&redirect=${encodeURIComponent(`/events/${category.slug}`)}`);
      return;
    }
    if (payTarget) {
      // Already hold a spot but haven't paid — go straight to payment.
      setPayInfo({ ...payTarget, stayOnPage: true });
      return;
    }
    setSelectedSize(minTeamSize);
    setLatentAnswers({});
    setSelectedGame("BGMI");
    setShowConfirm(true);
  };

  const confirmRegister = async () => {
    if (!dbEvent?.id) return;
    if (!selectedOption) return;
    if (isLatent && !latentComplete) {
      toast.error("Please answer all the selection questions.");
      return;
    }
    setRegistering(true);
    try {
      const body: Record<string, unknown> = { teamSize: selectedOption.value };
      if (isGaming) body.game = selectedGame;
      if (isLatent) {
        body.answers = Object.fromEntries(
          LATENT_QUESTIONS.map((q, i) => [q, (latentAnswers[i] ?? "").trim()])
        );
      }
      const res = await axios.post(`/api/events/${dbEvent.id}/register`, body);
      if (res.data.success) {
        const isPaid = res.data.data?.isPaidEvent;
        const registrationId = res.data.data?.registration?.id as string | undefined;
        const code = res.data.data?.registration?.registrationId as string | undefined;
        const regStatus = (res.data.data?.registration?.status as string | undefined) ?? "PENDING";
        const amount = Number(res.data.data?.price ?? selectedOption?.price ?? 0);
        setShowConfirm(false);
        if (registrationId) {
          setRegOverride({
            id: registrationId,
            registrationId: code ?? "",
            status: regStatus,
            eventName,
            price: amount,
            paymentStatus: null,
            needsPayment: !!isPaid,
          });
        }
        if (isPaid && registrationId) {
          // Razorpay-style: open payment bottom sheet immediately after registration
          toast.success("Registered! Complete your payment", { description: `You are registered for ${eventName}. Pay now to confirm your spot.` });
          setPayInfo({ registrationId, amount, stayOnPage: false });
        } else {
          const confirmed = regStatus === "CONFIRMED";
          toast.success(confirmed ? "Registered & confirmed!" : "Registered!", {
            description: confirmed
              ? `You are registered for ${eventName}. Your QR pass is ready.`
              : `You are registered for ${eventName}.`,
          });
          // WhatsApp group dialog only when no payment is due (finance-verified later otherwise)
          if (!isPaid) setShowWhatsApp(true);
        }
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
          setShowConfirm(false);
          try {
            const check = await axios.get(`/api/events/${dbEvent.id}/registration`);
            const reg = check.data?.data?.registration as ViewerEventRegistration | undefined;
            if (reg) setRegOverride(reg);
            if (reg?.needsPayment && reg?.id) {
              toast.info(`Already registered for ${eventName} — payment pending`, {
                description: "Complete payment to confirm your spot.",
              });
              const amount = Number(reg.price ?? price ?? selectedOption?.price ?? 0);
              setPayInfo({ registrationId: reg.id, amount, stayOnPage: false });
              return;
            }
            if (reg?.status === "CONFIRMED" || reg?.paymentStatus === "SUCCESS") {
              toast.success("Already registered — you're confirmed!");
              router.push("/dashboard/registrations");
              return;
            }
            toast.error(msg || "Already registered");
            router.push("/dashboard/registrations");
          } catch {
            toast.error(msg || "Already registered");
            router.push("/events");
          }
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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link href="/events" className="inline-flex items-center gap-2 text-[#0F172A]/60 hover:text-[#0F172A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to lineup
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 text-[#0F172A]/40">VVIT · {dateLabel} · Bengaluru</span>
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
                {!isSoloOnly && (
                  <span className="rounded-full border border-[#0F172A]/10 bg-[#0F172A]/5 px-2.5 py-1 font-mono text-[10px] tracking-wide">
                    {memberCountLabel(minTeamSize, maxTeamSize)}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-black leading-[0.9] tracking-tight sm:text-4xl">
                {eventName}
              </h1>
              <p className="mt-2 font-mono text-xs tracking-wide text-[#0F172A]/50">Part of {category.category.replace(/_/g, " ")} · VVIT Innovate Ignite &apos;26</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3C317] px-3 py-1.5 font-mono text-xs font-bold text-[#0F172A]">
                  <Banknote className="h-3.5 w-3.5" /> {price > 0 ? formatPriceLabel({ price, priceMode, groupPrice }) : "Free"}
                </span>
                {!isSoloOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 font-mono text-xs">
                    <Users className="h-3.5 w-3.5" /> {memberCountLabel(minTeamSize, maxTeamSize)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F172A]/10 bg-white px-3 py-1.5 font-mono text-xs">
                  <Calendar className="h-3.5 w-3.5" /> {dateLabel}
                </span>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#0F172A]/10 bg-[#0F172A]/[0.02] p-6">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#0F172A]/40">At a glance</p>
              <div className="mt-3 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[#0F172A]/60"><MapPin className="h-3.5 w-3.5" /> Venue</span>
                  <span className="font-bold text-[#0F172A]">{venue}</span>
                </div>
                {dbEvent?.time ? (
                  <div className="flex items-center justify-between rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[#0F172A]/60"><Clock className="h-3.5 w-3.5" /> Time</span>
                    <span className="font-bold text-[#0F172A]">{dbEvent.time}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between rounded-xl border border-[#0F172A]/10 bg-white px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[#0F172A]/60"><ShieldCheck className="h-3.5 w-3.5" /> Registration</span>
                  <span className="font-bold" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                </div>
              </div>
              {ctaMode === "register" ? (
                <button
                  onClick={handleRegister}
                  disabled={registering || !registrationsOpen}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {registering ? "Registering…" : "Register now"}
                </button>
              ) : ctaMode === "pay" && payTarget ? (
                <button
                  onClick={() => setPayInfo({ ...payTarget, stayOnPage: true })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  <Wallet className="h-4 w-4" /> Pay ₹{amountDue}
                </button>
              ) : ctaMode === "review" ? (
                <div
                  aria-disabled="true"
                  className="mt-4 flex w-full cursor-default items-center justify-center gap-2 rounded-full bg-[#0F172A] px-4 py-3 text-sm font-bold text-white opacity-60"
                >
                  <Clock className="h-4 w-4" /> Payment in review
                </div>
              ) : ctaMode === "closed" ? (
                <div
                  aria-disabled="true"
                  className="mt-4 flex w-full cursor-default items-center justify-center gap-2 rounded-full border border-[#0F172A]/15 bg-white px-4 py-3 text-sm font-bold text-[#0F172A]/60"
                >
                  <Ban className="h-4 w-4" /> Registration not active
                </div>
              ) : (
                <Link
                  href="/dashboard/registrations"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] px-4 py-3 text-sm font-bold text-white hover:bg-black transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" /> You&apos;re registered
                </Link>
              )}
              {ctaMode === "pay" ? (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/50">Already registered — pay to confirm your spot.</p>
              ) : ctaMode === "review" ? (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/50">Payment submitted. Finance verifies it shortly.</p>
              ) : ctaMode === "done" ? (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/40">{price > 0 ? "Tap for your pass and payment status." : "Tap for your QR pass."}</p>
              ) : ctaMode === "closed" ? (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/50">Contact the event coordinator if this looks wrong.</p>
              ) : !registrationsOpen ? (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/50">Registrations are {statusInfo.label.toLowerCase()}.</p>
              ) : (
                <p className="mt-2 text-center font-mono text-[11px] text-[#0F172A]/40">
                  {price > 0 ? `${formatPriceLabel({ price, priceMode, groupPrice })} · pay after registering` : "Free · instant confirmation"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6 pb-16">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {showAbout && (
              <div className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white">
                <button onClick={() => setOpen(open === "about" ? "" : "about")} className="flex w-full items-center justify-between px-5 py-4 text-left">
                  <span className="font-heading text-sm font-bold tracking-wide">About this event</span>
                  <ChevronDown className={`h-4 w-4 text-[#0F172A]/40 transition-transform ${open === "about" ? "rotate-180" : ""}`} />
                </button>
                {open === "about" && (
                  <div className="border-t border-[#0F172A]/10 px-5 py-5">
                    <div className="space-y-3 font-body text-sm leading-6 text-[#0F172A]/80">
                      {splitDbRules(dbEvent!.description ?? "").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white">
              <button onClick={() => setOpen(open === "guidelines" ? "" : "guidelines")} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="font-heading text-sm font-bold tracking-wide">Guidelines & Rules</span>
                <ChevronDown className={`h-4 w-4 text-[#0F172A]/40 transition-transform ${open === "guidelines" ? "rotate-180" : ""}`} />
              </button>
              {open === "guidelines" && (
                <div className="border-t border-[#0F172A]/10 px-5 py-5">
                  {rules && rules.length ? (
                    <ol className="list-decimal space-y-2 pl-5 font-body text-sm leading-6 text-[#0F172A]/80">
                      {rules.map((r, i) => (
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
                <span className="font-heading text-sm font-bold tracking-wide">
                  Coordinators
                </span>
                <ChevronDown className={`h-4 w-4 text-[#0F172A]/40 transition-transform ${open === "coords" ? "rotate-180" : ""}`} />
              </button>
              {open === "coords" && (
                <div className="border-t border-[#0F172A]/10 p-5">
                  {contactsStaff.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">Staff coordinators</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {contactsStaff.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#0F172A]/10 bg-white p-3">
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${style.bg}`}>
                              <Users className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold leading-none">{withProfPrefix(c.name)}</span>
                              {c.phone ? (
                                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-1 font-mono text-xs text-[#2362EC]"><Phone className="h-3 w-3" /> {c.phone}</a>
                              ) : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contactsStudents.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">Student coordinators</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {contactsStudents.map((c) => (
                          <div key={c.id} className={`flex items-center gap-3 rounded-xl border p-3 ${c.phone ? "border-[#0F172A]/10 bg-[#FFFBEB]" : "border-dashed border-[#0F172A]/15 bg-white"}`}>
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-white ${c.phone ? style.bg : "bg-[#0F172A]/20"}`}>
                              <Users className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold leading-none">{c.name}</span>
                              {c.phone ? (
                                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-1 font-mono text-xs text-[#2362EC]"><Phone className="h-3 w-3" /> {c.phone}</a>
                              ) : (
                                <span className="mt-1 font-mono text-xs text-[#0F172A]/40">Contact via faculty</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contactsStaff.length + contactsStudents.length === 0 && (
                    <p className="font-mono text-sm text-[#0F172A]/50">Coordinator info pending — check event poster or contact VVIT SPOC.</p>
                  )}
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

      <WhatsAppJoinDialog
        open={showWhatsApp}
        onOpenChange={(val) => {
          setShowWhatsApp(val);
          if (!val) router.push("/events");
        }}
        title={`Registered for ${eventName}! 🎉`}
        description="You're all set. Join the WhatsApp group for real-time event updates, schedule changes, and coordinator announcements so you don't miss anything."
      />

      {payInfo && (
        <PaySheet
          open={!!payInfo}
          onOpenChange={(val) => {
            if (!val) closePaySheet(false);
          }}
          registrationId={payInfo.registrationId}
          amount={payInfo.amount}
          onSubmitted={() => closePaySheet(true)}
        />
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className={`${isLatent ? "sm:max-w-lg max-h-[90vh] overflow-y-auto" : "sm:max-w-md"} rounded-2xl`}>
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight">
              {eventName}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {isLatent
                ? "Answer the selection questions below — the panel uses them to shortlist performers."
                : <>The team <strong>leader</strong> registers for the whole team — the leader is counted in the team size you pick below.</>}
            </DialogDescription>
          </DialogHeader>

          {isGaming && (
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">Choose your game</p>
              <div className="grid grid-cols-2 gap-2">
                {(["BGMI", "Free Fire"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGame(g)}
                    className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      selectedGame === g
                        ? "border-[#0F172A] bg-[#0F172A] text-white"
                        : "border-[#0F172A]/15 bg-white text-[#0F172A] hover:border-[#0F172A]/40"
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">{g}</span>
                    <span className={`mt-1 block font-mono text-[11px] ${selectedGame === g ? "text-white/70" : "text-[#0F172A]/50"}`}>Squad of {maxTeamSize} · {formatPriceLabel({ price, priceMode, groupPrice })}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">
              Team size {memberCountLabel(minTeamSize, maxTeamSize)}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedSize(opt.value)}
                  className={`flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    selectedSize === opt.value
                      ? "border-[#0F172A] bg-[#0F172A] text-white"
                      : "border-[#0F172A]/15 bg-white text-[#0F172A] hover:border-[#0F172A]/40"
                  }`}
                >
                  <span className="text-sm font-bold leading-none">{opt.label}</span>
                  <span className={`mt-1.5 font-mono text-xs ${selectedSize === opt.value ? "text-white/70" : "text-[#0F172A]/50"}`}>
                    {opt.price > 0 ? `₹${opt.price}` : "Free"}
                  </span>
                </button>
              ))}
            </div>
            <p className="pt-1 font-mono text-[11px] text-[#0F172A]/50">
              {selectedOption ? (price > 0 ? `${formatPriceLabel({ price, priceMode, groupPrice })} · ₹${selectedOption.price} total` : "Free · no payment needed") : ""}
            </p>
          </div>

          {isLatent && (
            <div className="space-y-3">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F172A]/40">
                Selection questions · all required
              </p>
              {LATENT_QUESTIONS.map((q, i) => (
                <label key={i} className="block">
                  <span className="mb-1 block text-sm font-medium leading-5 text-[#0F172A]">{i + 1}. {q}</span>
                  <textarea
                    value={latentAnswers[i] ?? ""}
                    onChange={(e) => setLatentAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                    rows={2}
                    placeholder="Your answer…"
                    className="w-full rounded-xl border border-[#0F172A]/15 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#0F172A]/35 focus:border-[#2362EC]/40 focus:outline-none focus:ring-4 focus:ring-[#2362EC]/10"
                  />
                </label>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-full">Cancel</Button>
            <Button onClick={confirmRegister} disabled={registering || (isLatent && !latentComplete)} className="rounded-full bg-[#0F172A] text-white hover:bg-black">
              {registering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…</> : selectedOption && selectedOption.price > 0 ? `Register team · ₹${selectedOption.price}` : "Register team · Free"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
