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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/LoadingButton";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ArrowRight, KeyRound, User } from "lucide-react";
import { motion } from "framer-motion";

// Logos – same imports as signin page
import gatLogo from "@/public/gat-logos/college-logo.png";
import innovateIgniteLogo from "@/public/gat-logos/innovate-ignite.png";
import MagneticButton from "@/components/ui/MagneticButton";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { signInWithGoogle } from "@/app/auth/googleActions";

// OTP registration schemas
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerCompleteSchema,
} from "@/lib/schemas/newAuth";

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = email → OTP, 2 = verify OTP, 3 = complete profile
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [visibility, setVisibility] = useState<boolean>(false);

  // Step 1 – request OTP
  const emailForm = useForm<z.infer<typeof sendOtpSchema>>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: "" },
  });

  // Step 2 – verify OTP
  const otpForm = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  // Step 3 – complete registration (no photo, no Aadhaar)
  const completeForm = useForm<z.infer<typeof registerCompleteSchema>>({
    resolver: zodResolver(registerCompleteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      collegeName: "",
      collegeIdNumber: "",
      password: "",
    },
  });

  async function handleSendOtp(values: z.infer<typeof sendOtpSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/register/send-otp", values);
      if (response.data.success) {
        setEmail(values.email);
        otpForm.setValue("email", values.email);
        completeForm.setValue("email", values.email);
        setStep(2);
        toast.success("OTP sent!", {
          description: "Check your inbox for the 6-digit code.",
        });
      } else {
        setError(response.data.error?.message ?? "Could not send OTP.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setError(error.response.data.error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(values: z.infer<typeof verifyOtpSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/register/verify-otp", values);
      if (response.data.success) {
        setStep(3);
        toast.success("Email verified!", {
          description: "Now complete your profile.",
        });
      } else {
        otpForm.setError("otp", {
          type: "manual",
          message: response.data.error?.message ?? "Invalid OTP.",
        });
        setError(response.data.error?.message ?? "Invalid OTP.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        otpForm.setError("otp", {
          type: "manual",
          message: error.response.data.error.message,
        });
        setError(error.response.data.error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleComplete(values: z.infer<typeof registerCompleteSchema>) {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "/api/auth/register/complete",
        values
      );
      if (response.data.success) {
        toast.success("Account created!", {
          description: "Welcome aboard!",
        });
        // The API sets the auth cookie – route the user home
        router.push("/dashboard");
      } else {
        setError(
          response.data.error?.message ??
            "Could not complete registration. Please try again."
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setError(error.response.data.error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Visual layer ────────────────────────────────────────────────────────────

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 mt-20 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 65% 55% at 60% 35%, hsl(var(--primary) / 0.09) 0%, transparent 65%),
          radial-gradient(ellipse 45% 45% at 5% 85%,  hsl(var(--secondary) / 0.07) 0%, transparent 55%),
          hsl(var(--background))
        `,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-100" />

      {/* Ghost watermark like home page */}
      <div
        className="font-display absolute left-[-2%] bottom-[4%] font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: "clamp(90px,14vw,170px)",
          color: "hsl(var(--primary) / 0.1)",
          letterSpacing: "-0.02em",
        }}
        aria-hidden
      >
        VVIT Innovate Ignite
      </div>
      <div
        className="font-display absolute right-[-2%] top-[4%] font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: "clamp(90px,14vw,170px)",
          color: "hsl(var(--primary) / 0.1)",
          letterSpacing: "-0.02em",
        }}
        aria-hidden
      >
        2K26
      </div>

      {/* Announcement marquee */}
      <div
        className="absolute top-0 left-0 right-0 border-b py-2.5 overflow-hidden z-20"
        style={{
          borderColor: "hsl(var(--border))",
          background: "hsl(var(--secondary) / 0.05)",
        }}
      >
        <style>{`
          @keyframes marquee-scroll-signup {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .marquee-track-signup {
            animation: marquee-scroll-signup 26s linear infinite;
            display: flex;
            width: max-content;
          }
          .marquee-track-signup:hover { animation-play-state: paused; }
        `}</style>
        <div className="whitespace-nowrap marquee-track-signup">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="text-xs font-bold uppercase tracking-[0.18em] mx-12 flex-shrink-0"
              style={{ color: "hsl(var(--foreground) / 0.5)" }}
            >
              Registrations Starting Soon · Stay tuned for updates · VVIT Innovate Ignite ·
            </span>
          ))}
        </div>
      </div>

      {/* ── Registration card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="rounded-[var(--radius)] overflow-hidden"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              {/* Logo */}
              <div className="mb-2 flex items-center justify-center gap-4">
                <Image
                  src={gatLogo}
                  alt="VVIT Logo"
                  width={52}
                  height={52}
                  className="object-contain opacity-100"
                />
                <Image
                  src={innovateIgniteLogo}
                  alt="VVIT Innovate Ignite Logo"
                  width={52}
                  height={52}
                  className="object-contain opacity-100"
                />
              </div>

              {/* Title */}
              <div className="flex items-center gap-2">
                <h1
                  className="font-display text-4xl font-black tracking-tighter"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Create Account
                </h1>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: s === step ? 28 : 10,
                      background:
                        s <= step
                          ? "hsl(var(--primary))"
                          : "hsl(var(--border))",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-7">
            {/* STEP 1 – Email */}
            {step === 1 && (
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(handleSendOtp)}
                  className="space-y-5"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          Registered Email ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 transition-all duration-200"
                            style={{
                              background: "hsl(var(--background))",
                              color: "hsl(var(--foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            placeholder="Enter your email"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-xs text-red-400 text-center bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <MagneticButton className="w-full">
                    <LoadingButton
                      type="submit"
                      loading={isLoading}
                      className="w-full font-bold tracking-wide h-11"
                      style={{
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    >
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </LoadingButton>
                  </MagneticButton>
                </form>
              </Form>
            )}

            {/* STEP 2 – OTP */}
            {step === 2 && (
              <>
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                    className="space-y-5"
                  >
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                            style={{ color: "hsl(var(--muted))" }}
                          >
                            Enter OTP
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-11 text-center font-mono-jb text-lg tracking-[0.4em] transition-all duration-200"
                              style={{
                                background: "hsl(var(--background))",
                                color: "hsl(var(--foreground))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                              placeholder="••••••"
                              inputMode="numeric"
                              maxLength={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-xs text-red-400 text-center bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                      </div>
                    )}

                    <MagneticButton className="w-full">
                      <LoadingButton
                        type="submit"
                        loading={isLoading}
                        className="w-full font-bold tracking-wide h-11"
                        style={{
                          background: "hsl(var(--primary))",
                          color: "hsl(var(--primary-foreground))",
                          borderRadius: "calc(var(--radius) - 2px)",
                        }}
                      >
                        Verify OTP <KeyRound className="h-4 w-4" />
                      </LoadingButton>
                    </MagneticButton>
                  </form>
                </Form>

                <button
                  type="button"
                  className="mt-4 w-full text-center text-xs hover:underline"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                >
                  ← Change email / re-send OTP
                </button>
              </>
            )}

            {/* STEP 3 – Complete profile (no photo, no Aadhaar) */}
            {step === 3 && (
              <Form {...completeForm}>
                <form
                  onSubmit={completeForm.handleSubmit(handleComplete)}
                  className="space-y-5"
                >
                  <FormField
                    control={completeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 transition-all duration-200"
                            style={{
                              background: "hsl(var(--background))",
                              color: "hsl(var(--foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completeForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 transition-all duration-200"
                            style={{
                              background: "hsl(var(--background))",
                              color: "hsl(var(--foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            placeholder="10-digit mobile number"
                            inputMode="numeric"
                            maxLength={10}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completeForm.control}
                    name="collegeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          College Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 transition-all duration-200"
                            style={{
                              background: "hsl(var(--background))",
                              color: "hsl(var(--foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            placeholder="Enter your college name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completeForm.control}
                    name="collegeIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          College ID Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-11 transition-all duration-200"
                            style={{
                              background: "hsl(var(--background))",
                              color: "hsl(var(--foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            placeholder="Enter your college ID number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={completeForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className="font-mono-jb text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="h-11 pr-10 transition-all duration-200"
                              style={{
                                background: "hsl(var(--background))",
                                color: "hsl(var(--foreground))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                              type={visibility ? "text" : "password"}
                              placeholder="Create a password (min 6 chars)"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setVisibility((prev) => !prev)}
                              className="absolute right-3 top-3 transition-colors duration-200"
                              style={{ color: "hsl(var(--muted))" }}
                            >
                              {visibility ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-xs text-red-400 text-center bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <MagneticButton className="w-full">
                    <LoadingButton
                      type="submit"
                      loading={isLoading}
                      className="w-full font-bold tracking-wide h-11"
                      style={{
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        borderRadius: "calc(var(--radius) - 2px)",
                      }}
                    >
                      Create Account <User className="h-4 w-4" />
                    </LoadingButton>
                  </MagneticButton>
                </form>
              </Form>
            )}

            {/* Divider */}
            <div
              className="relative flex items-center gap-4 my-1"
              aria-hidden="true"
            >
              <div
                className="h-px flex-1"
                style={{ background: "hsl(var(--border))" }}
              />
              <span
                className="text-[10px] font-semibold tracking-[0.22em] uppercase"
                style={{
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                or continue with Google
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "hsl(var(--border))" }}
              />
            </div>

            <form action={signInWithGoogle}>
              <GoogleSignInButton />
            </form>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-6 border-t text-center"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <p
              className="text-xs"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold hover:underline"
                style={{ color: "hsl(var(--primary))" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
