import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: ["shriek-bullish-chaste.ngrok-free.dev"],

    typescript: {
        ignoreBuildErrors: true, // Prevents broken builds due to TypeScript errors
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pmbiutabpnlupcukjgzx.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },

    async headers() {
        return [
            {
                // The brochure is embedded in our own bottom sheet, so it has to be
                // framable by us. 'self' + SAMEORIGIN still blocks third-party
                // framing, which is the actual clickjacking vector.
                source: "/brochure/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com https://www.google.co.in https://maps.gstatic.com; frame-ancestors 'self';",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                ],
            },
            {
                // Everything else keeps the strict no-framing policy.
                source: "/((?!brochure/).*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com https://www.google.co.in https://maps.gstatic.com; frame-ancestors 'none';",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY", // Prevents Clickjacking
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff", // Prevents MIME-type sniffing
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload", // Enforces HTTPS
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "geolocation=(), microphone=(), camera=(self)",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
