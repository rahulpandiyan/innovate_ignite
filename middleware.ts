import { NextResponse, NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/authCookie";
import { Redis } from "@upstash/redis"; // Use Upstash Redis

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn("[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Rate limiting disabled.");
}

const redis = redisUrl && redisToken 
  ? new Redis({ 
      url: redisUrl, 
      token: redisToken 
    })
  : null;

const GLOBAL_RATE_LIMIT_WINDOW = 60; // Time window in seconds
const GLOBAL_RATE_LIMIT_MAX = 100; // Maximum requests allowed per window
const OTP_RATE_LIMIT_WINDOW = 60; // Time window in seconds for OTP
const OTP_RATE_LIMIT_MAX = 5; // Maximum OTP requests per window

const protectedRoutes: string[] = [
    "/admin",
    "/coordinator",
    "/dashboard",
    "/judge",
    "/attendance",
    "/certificates",
    "/payments",
    "/college-admin",
    "/api/admin",
    "/api/cart",
    "/api/orders",
    "/api/teams",
    "/api/invites",
];

const superAdminRoutes: string[] = [
    "/admin",
];

const coordinatorRoutes: string[] = [
    "/coordinator",
];


export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Extract IP address
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-real-ip") ||
        "unknown";

    // Apply OTP-specific rate limiting (skip if Redis unavailable)
    if (path === "/api/auth/register/send-otp" && redis) {
        try {
            const otpRedisKey = `otp-rate-limit:${ip}`;
            const currentOtpRequests = await redis.incr(otpRedisKey);
            if (currentOtpRequests === 1) {
                await redis.expire(otpRedisKey, OTP_RATE_LIMIT_WINDOW);
            }

            if (currentOtpRequests > OTP_RATE_LIMIT_MAX) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Too many OTP requests, please try again later.",
                    },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("[Redis OTP Error]", error);
        }
    }

    // Apply global rate limiting for all routes (skip if Redis unavailable)
    let currentGlobalRequests = 1;
    if (redis) {
        try {
            const globalRedisKey = `rate-limit:${ip}:${path}`;
            currentGlobalRequests = await redis.incr(globalRedisKey);
            if (currentGlobalRequests === 1) {
                await redis.expire(globalRedisKey, GLOBAL_RATE_LIMIT_WINDOW);
            }
        } catch (error) {
            console.error("[Redis Rate Limit Error]", error);
            // Continue without rate limiting
        }
    }

    if (currentGlobalRequests > GLOBAL_RATE_LIMIT_MAX) {
        return NextResponse.json(
            {
                success: false,
                message: "Too many requests, please try again later.",
            },
            { status: 429 }
        );
    }

    const authToken = request.cookies.get("auth_token")?.value;
    const session = authToken ? await verifyAuthToken(authToken) : null;

    // Super-admin-only routes
    if (superAdminRoutes.some(route => path.startsWith(route)) && (!session?.id || session?.role !== "SUPER_ADMIN")) {
        const signInUrl = new URL("/auth/signin", request.nextUrl);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Coordinator routes: EVENT_COORDINATOR / STUDENT_COORDINATOR (or SUPER_ADMIN)
    if (coordinatorRoutes.some(route => path.startsWith(route)) && (!session?.id || (!["EVENT_COORDINATOR", "STUDENT_COORDINATOR"].includes(session.role) && session?.role !== "SUPER_ADMIN"))) {
        const signInUrl = new URL("/auth/signin", request.nextUrl);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Authenticated routes
    if (protectedRoutes.some(route => path.startsWith(route)) && !session?.id) {
        const signInUrl = new URL("/auth/signin", request.nextUrl);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
}

export const config = {
    matcher: [
        "/admin",
        "/admin/:path*",
        "/coordinator",
        "/coordinator/:path*",
        "/dashboard",
        "/dashboard/:path*",
        "/judge",
        "/judge/:path*",
        "/attendance",
        "/attendance/:path*",
        "/certificates",
        "/certificates/:path*",
        "/payments",
        "/payments/:path*",
        "/college-admin",
        "/college-admin/:path*",
        "/api/admin/:path*",
    ],
};