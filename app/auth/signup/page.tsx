export const dynamic = 'force-dynamic';

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/LoadingButton";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, KeyRound, User, Sparkles, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import gatLogo from "@/public/gat-logos/college-logo.png";
import innovateIgniteLogo from "@/public/gat-logos/innovate-ignite.png";
import MagneticButton from "@/components/ui/MagneticButton";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { signInWithGoogle } from "@/app/auth/googleActions";
import { sendOtpSchema, verifyOtpSchema, registerCompleteSchema } from "@/lib/schemas/newAuth";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibility, setVisibility] = useState(false);

  const emailForm = useForm<z.infer<typeof sendOtpSchema>>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });
  const completeForm = useForm<z.infer<typeof registerCompleteSchema>>({
    resolver: zodResolver(registerCompleteSchema),
    defaultValues: { name: "", email: "", phone: "", collegeName: "", collegeIdNumber: "", password: "" },
  });

  async function handleSendOtp(values: z.infer<typeof sendOtpSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const r = await axios.post("/api/auth/register/send-otp", values);
      if (r.data.success) {
        setEmail(values.email);
        otpForm.setValue("email", values.email);
        completeForm.setValue("email", values.email);
        setStep(2);
        toast.success("OTP sent!", { description: "Check your inbox for the 6-digit code." });
      } else setError(r.data.error?.message ?? "Could not send OTP.");
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data?.error?.message) setError(e.response.data.error.message);
      else setError("Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  }
  async function handleVerifyOtp(values: z.infer<typeof verifyOtpSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const r = await axios.post("/api/auth/register/verify-otp", values);
      if (r.data.success) {
        setStep(3);
        toast.success("Email verified!", { description: "Now complete your profile." });
      } else {
        otpForm.setError("otp", { type: "manual", message: r.data.error?.message ?? "Invalid OTP." });
        setError(r.data.error?.message ?? "Invalid OTP.");
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data?.error?.message) {
        otpForm.setError("otp", { type: "manual", message: e.response.data.error.message });
        setError(e.response.data.error.message);
      } else setError("Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  }
  async function handleComplete(values: z.infer<typeof registerCompleteSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const r = await axios.post("/api/auth/register/complete", values);
      if (r.data.success) {
        if (eventId) {
          try {
            const regRes = await axios.post(`/api/events/${eventId}/register`);
            const isPaid = regRes.data?.data?.isPaidEvent;
            if (isPaid) {
              toast.success("Account created & registered — payment pending", { description: "Complete payment in dashboard to confirm. Registration shows as pending until paid." });
            } else {
              toast.success("Account created & registered!", { description: "You are registered for the event. Check dashboard." });
            }
          } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 409) {
              toast.success("Account created!", { description: "You were already registered for that event." });
            } else {
              const msg = axios.isAxiosError(e) ? e.response?.data?.error?.message : undefined;
              toast.success("Account created!", { description: msg || "Welcome aboard! Please confirm your event registration in dashboard." });
            }
          }
          router.push("/dashboard/registrations");
        } else {
          toast.success("Account created!", { description: "Welcome aboard!" });
          router.push("/dashboard");
        }
      } else setError(r.data.error?.message ?? "Could not complete registration.");
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data?.error?.message) setError(e.response.data.error.message);
      else setError("Something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20 pb-24 md:pb-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      <div className="overflow-hidden border-y border-[#0F172A]/10 bg-[#0F172A] py-2">
        <div className="flex animate-[marquee_22s_linear_infinite] whitespace-nowrap font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-white">
          <span className="mx-6">JOIN 1000+ STUDENTS · 10 STAGES · 6 DOMAINS · VVIT BENGALURU · MAY 13–15</span>
          <span className="mx-6" aria-hidden>JOIN 1000+ STUDENTS · 10 STAGES · 6 DOMAINS · VVIT BENGALURU · MAY 13–15</span>
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* LEFT — POSTER — hidden on mobile so form is at top, no scroll */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="hidden lg:block lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute -left-3 top-6 h-6 w-20 rotate-[-8deg] rounded-sm bg-[#F3C317]/80 shadow-sm" />
            <div className="absolute -right-2 top-10 h-6 w-16 rotate-[8deg] rounded-sm bg-[#19E3A8]/80 shadow-sm" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19E3A8]" />
                STEP {step} OF 3
              </div>
              <h1 className="mt-4 leading-[0.86] tracking-[-0.03em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="block text-[44px] sm:text-[52px]">CREATE</span>
                <span className="block text-[44px] sm:text-[52px] text-[#2362EC]">ACCOUNT</span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#0F172A]/60">
                One pass for all 10 stages. Verify your email, then complete your profile. No spam — just your lineup.
              </p>
              <div className="mt-5 flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-[#0F172A]" : s < step ? "w-8 bg-[#19E3A8]" : "w-6 bg-[#0F172A]/10"}`} />
                ))}
                <span className="ml-2 font-mono text-xs text-[#0F172A]/50">
                  {step === 1 ? "Email" : step === 2 ? "Verify OTP" : "Profile"}
                </span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Image src={gatLogo} alt="VVIT" width={40} height={40} className="h-8 w-auto" />
                <span className="h-6 w-px bg-[#0F172A]/10" />
                <Image src={innovateIgniteLogo} alt="Ignite" width={40} height={40} className="h-8 w-auto" />
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-[#0F172A]/15 bg-white p-4">
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-[#0F172A]/60">
              <ShieldCheck className="h-3.5 w-3.5" /> WHAT YOU NEED
            </p>
            <ul className="mt-2 space-y-1.5 font-mono text-xs leading-5 text-[#0F172A]/60">
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0F172A]/30" /> College email (OTP in ~30s)</li>
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0F172A]/30" /> Phone + College ID</li>
              <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0F172A]/30" /> Password (min 6 chars)</li>
            </ul>
          </div>
        </motion.div>

        {/* RIGHT — FORM — first on mobile */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="col-span-12 lg:col-span-7 lg:col-start-6 xl:col-start-auto">
          <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[#0F172A]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold">
                  {step === 1 ? "Verify your email" : step === 2 ? "Enter OTP" : "Complete profile"}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest border border-[#0F172A]/10">
                  {step === 1 && <><Mail className="h-3 w-3" /> STEP 1</>}
                  {step === 2 && <><KeyRound className="h-3 w-3" /> STEP 2</>}
                  {step === 3 && <><User className="h-3 w-3" /> STEP 3</>}
                </span>
              </div>
              {eventId && (
                <div className="mt-4 rounded-xl border border-[#2362EC]/20 bg-[#EFF6FF] px-3 py-2.5 font-mono text-xs leading-5 text-[#0F172A]">
                  <span className="font-bold">You&apos;ll be registered for this event right after account creation.</span> Just complete the steps — confirmation dialog is handled for you.
                </div>
              )}

              {step === 1 && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="mt-6 space-y-4">
                    <FormField control={emailForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">College Email</FormLabel>
                        <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-[16px] sm:text-sm focus:bg-white" placeholder="you@college.edu" type="email" {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</div>}
                    <MagneticButton className="w-full">
                      <LoadingButton type="submit" loading={isLoading} className="h-11 w-full rounded-full bg-[#0F172A] font-bold text-white hover:bg-black">
                        Send OTP <ArrowRight className="h-4 w-4" />
                      </LoadingButton>
                    </MagneticButton>
                  </form>
                </Form>
              )}

              {step === 2 && (
                <>
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="mt-6 space-y-4">
                      <FormField control={otpForm.control} name="otp" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">6-digit code sent to {email}</FormLabel>
                          <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-center text-[16px] sm:text-sm font-mono text-lg tracking-[0.35em] focus:bg-white" placeholder="••••••" inputMode="numeric" maxLength={6} {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</div>}
                      <MagneticButton className="w-full">
                        <LoadingButton type="submit" loading={isLoading} className="h-11 w-full rounded-full bg-[#0F172A] font-bold text-white hover:bg-black">
                          Verify OTP <KeyRound className="h-4 w-4" />
                        </LoadingButton>
                      </MagneticButton>
                    </form>
                  </Form>
                  <button onClick={() => { setStep(1); setError(""); }} className="mt-4 w-full text-center font-mono text-xs text-[#0F172A]/50 hover:text-[#0F172A] hover:underline">← Change email</button>
                </>
              )}

              {step === 3 && (
                <Form {...completeForm}>
                  <form onSubmit={completeForm.handleSubmit(handleComplete)} className="mt-6 space-y-4">
                    <FormField control={completeForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">Full Name</FormLabel>
                        <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-[16px] sm:text-sm focus:bg-white" placeholder="Your name" {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={completeForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">Phone</FormLabel>
                        <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-[16px] sm:text-sm focus:bg-white" placeholder="10-digit mobile" inputMode="numeric" maxLength={10} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={completeForm.control} name="collegeName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">College Name</FormLabel>
                        <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-[16px] sm:text-sm focus:bg-white" placeholder="e.g. VVIT, Bengaluru" {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={completeForm.control} name="collegeIdNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">College ID Number</FormLabel>
                        <FormControl><Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 text-[16px] sm:text-sm focus:bg-white" placeholder="USN / ID" {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={completeForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 pr-10 text-[16px] sm:text-sm focus:bg-white" type={visibility ? "text" : "password"} placeholder="Min 6 characters" {...field} />
                            <button type="button" onClick={() => setVisibility((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F172A]/40 hover:text-[#0F172A]">
                              {visibility ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</div>}
                    <MagneticButton className="w-full">
                      <LoadingButton type="submit" loading={isLoading} className="h-11 w-full rounded-full bg-[#0F172A] font-bold text-white hover:bg-black">
                        Create account <User className="h-4 w-4" />
                      </LoadingButton>
                    </MagneticButton>
                  </form>
                </Form>
              )}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#0F172A]/10" />
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#0F172A]/30">or continue with</span>
                <div className="h-px flex-1 bg-[#0F172A]/10" />
              </div>
              <form action={signInWithGoogle}>
                <GoogleSignInButton />
              </form>

              <p className="mt-6 text-center font-mono text-xs text-[#0F172A]/50">
                Already have an account?{" "}
                <Link
                  href={eventId ? `/auth/signin?eventId=${eventId}` : "/auth/signin"}
                  className="font-bold text-[#0F172A] hover:text-[#2362EC] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
