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
                hostname: `${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh`,
                pathname: "/f/*",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
                pathname: "/f/*",
            },
        ],
    },

    async headers() {
        return [
            {
                source: "/(.*)",
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
