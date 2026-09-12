import type { AuthConfig } from "@auth/core";
import { connect, type ConnectProfile } from "@vercel/connect/authjs";
import prisma from "@/lib/db";
import { setAuthCookie } from "@/lib/authCookie";

export const authConfig: AuthConfig = {
  trustHost: true,
  providers: [
    connect({
      id: "google",
      name: "Google",
      connector: process.env.CONNECTOR_GOOGLE!,
      scopes: ["openid", "profile", "email"],
    }),
  ],
  events: {
    /**
     * Vercel Connect authenticates the Google user upstream, then Auth.js
     * calls this event. We bridge the verified identity into the app's own
     * httpOnly `auth_token` session so the rest of the app (middleware,
     * role-cookie routing, /auth/me) keeps working exactly as before.
     */
    async signIn({ user }) {
      try {
        const email = user.email?.toLowerCase();
        if (!email) return;

        const sub = String(user.id ?? email);
        const name = user.name ?? email.split("@")[0];
        const photo = user.image ?? null;

        // Reuse the same "role first, then fall back" resolution the
        // email/OTP login path uses, so Google and password login agree.
        const existing = await prisma.user.findUnique({
          where: { email },
          include: { userRole: { select: { name: true } } },
        });
        const roleName =
          existing?.userRole?.name ?? existing?.role ?? "PARTICIPANT";
        const roleRow = await prisma.userRole.findUnique({
          where: { name: roleName },
        });

        const dbUser = await prisma.user.upsert({
          where: { email },
          create: {
            name,
            email,
            phone: `+google-${sub}`,
            collegeName: "",
            role: roleName === "SUPER_ADMIN" ? "SUPER_ADMIN" : "PARTICIPANT",
            roleId: roleRow?.id,
            password: null,
            emailVerified: true,
            photoUrl: photo,
          },
          update: { name, photoUrl: photo, emailVerified: true },
        });

        await setAuthCookie({
          id: dbUser.id,
          email: dbUser.email,
          role: roleName,
          collegeId: dbUser.collegeId,
          roleId: dbUser.roleId,
        });
      } catch (error) {
        console.error("[auth/google] failed to bridge Vercel Connect user", error);
      }
    },
  },
};
