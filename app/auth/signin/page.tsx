"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/LoadingButton";
import { useAuthContext } from "@/contexts/auth-context";
import { newLoginSchema } from "@/lib/schemas/newAuth";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import gatLogo from "@/public/gat-logos/college-logo.png";
import innovateIgniteLogo from "@/public/gat-logos/innovate-ignite.png";
import MagneticButton from "@/components/ui/MagneticButton";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { signInWithGoogle } from "@/app/auth/googleActions";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setIsLoggedIn } = useAuthContext();
  const [visibility, setVisibility] = useState<boolean>(false);

  const form = useForm<z.infer<typeof newLoginSchema>>({
    resolver: zodResolver(newLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof newLoginSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/login", { email: values.email, password: values.password });
      if (response.data.success) {
        setIsLoggedIn(true);
        toast.success("Login successful!", { description: "Welcome back!" });
        const user = response.data.data?.user;
        const home = user?.home ?? (user?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
        router.push(home);
      } else {
        form.setError("email", { type: "manual", message: "Invalid credentials" });
        form.setError("password", { type: "manual", message: "Invalid credentials" });
        setError(response.data.error?.message ?? "Invalid email or password.");
        setIsLoading(false);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setError(error.response.data.error.message);
        form.setError("email", { type: "manual", message: "Invalid credentials" });
        form.setError("password", { type: "manual", message: "Invalid credentials" });
      } else {
        setError("An error occurred during login. Please try again.");
      }
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBEB] pt-20">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@600&display=swap');`}</style>

      {/* ticker */}
      <div className="overflow-hidden border-y border-[#0F172A]/10 bg-[#0F172A] py-2">
        <div className="flex animate-[marquee_22s_linear_infinite] whitespace-nowrap font-mono text-[11px] tracking-[0.16em] uppercase text-white">
          <span className="mx-6">TECHNINJA ◆ VV CARE ◆ COOKING WITHOUT FIRE ◆ TALENT MANIA ◆ COLLAGE ◆ ICEBREAKER ◆ DUMB CHARADES ◆ CODE CONFLUX ◆ DANCE ELITE ◆ BGMI</span>
          <span className="mx-6" aria-hidden>TECHNINJA ◆ VV CARE ◆ COOKING WITHOUT FIRE ◆ TALENT MANIA ◆ COLLAGE ◆ ICEBREAKER ◆ DUMB CHARADES ◆ CODE CONFLUX ◆ DANCE ELITE ◆ BGMI</span>
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* LEFT — POSTER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-12 lg:col-span-5"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute -left-3 top-6 h-6 w-20 rotate-[-8deg] rounded-sm bg-[#19E3A8]/80 shadow-sm" />
            <div className="absolute -right-2 top-10 h-6 w-16 rotate-[8deg] rounded-sm bg-[#F3C317] shadow-sm" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#19E3A8]" /> VVIT · MAY 13–15
              </div>
              <h1 className="mt-4 leading-[0.86] tracking-[-0.03em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="block text-[44px] sm:text-[56px]">WELCOME</span>
                <span className="block text-[44px] sm:text-[56px] text-[#2362EC]">BACK</span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#0F172A]/60">
                Your pass to 10 stages. Sign in to register, form teams, and track your lineup. One portal — all venues on campus.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Image src={gatLogo} alt="VVIT" width={48} height={48} className="h-9 w-auto" />
                <span className="h-6 w-px bg-[#0F172A]/10" />
                <Image src={innovateIgniteLogo} alt="Ignite" width={48} height={48} className="h-9 w-auto" />
              </div>
              <div className="mt-6 inline-flex -rotate-1 rounded-xl bg-[#FFF1A6] px-3 py-1.5 shadow" style={{ fontFamily: "'Caveat', cursive" }}>
                <span className="text-sm">Psst — 10 events, 6 domains →</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#0F172A]/10 bg-white px-3 py-3 text-center">
              <div className="font-heading text-lg font-black">10</div>
              <div className="font-mono text-[10px] tracking-widest text-[#0F172A]/50">EVENTS</div>
            </div>
            <div className="rounded-xl border border-[#0F172A]/10 bg-white px-3 py-3 text-center">
              <div className="font-heading text-lg font-black">3</div>
              <div className="font-mono text-[10px] tracking-widest text-[#0F172A]/50">DAYS</div>
            </div>
            <div className="rounded-xl border border-[#0F172A]/10 bg-white px-3 py-3 text-center">
              <div className="font-heading text-lg font-black">6</div>
              <div className="font-mono text-[10px] tracking-widest text-[#0F172A]/50">DOMAINS</div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="col-span-12 lg:col-span-7"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[#0F172A]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-bold tracking-tight">Sign in</h2>
                  <p className="mt-1 font-mono text-xs tracking-wide text-[#0F172A]/50">Inter-collegiate registration portal</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#19E3A8]/15 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-[#0F172A]">
                  <Sparkles className="h-3 w-3" /> SECURE
                </span>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">Registered Email ID</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 focus:bg-white" placeholder="you@college.edu" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#0F172A]/60">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="h-11 rounded-xl border-[#0F172A]/10 bg-[#FFFBEB]/50 pr-10 focus:bg-white" type={visibility ? "text" : "password"} placeholder="••••••••" {...field} />
                            <button type="button" onClick={() => setVisibility((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F172A]/40 hover:text-[#0F172A]">
                              {visibility ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                        <div className="flex justify-end">
                          <Link href="/auth/forgotpassword" className="font-mono text-xs text-[#2362EC] hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </FormItem>
                    )}
                  />
                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</div>}
                  <MagneticButton className="w-full">
                    <LoadingButton type="submit" loading={isLoading} className="h-11 w-full rounded-full bg-[#0F172A] font-bold text-white hover:bg-black">
                      Sign in <ArrowRight className="h-4 w-4" />
                    </LoadingButton>
                  </MagneticButton>
                </form>
              </Form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#0F172A]/10" />
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#0F172A]/30">or continue with</span>
                <div className="h-px flex-1 bg-[#0F172A]/10" />
              </div>

              <form action={signInWithGoogle}>
                <GoogleSignInButton />
              </form>

              <p className="mt-6 text-center font-mono text-xs text-[#0F172A]/50">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="font-bold text-[#0F172A] hover:text-[#2362EC] hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-[#0F172A]/40">Protected by VVIT · One pass for all 10 stages</p>
        </motion.div>
      </div>
    </div>
  );
}
