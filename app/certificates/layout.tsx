import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { CertShell } from "@/components/certs/cert-shell";

const ALLOWED = new Set(["CERTIFICATE_ADMIN", "SUPER_ADMIN"]);

export default async function CertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!ALLOWED.has(session.role)) redirect(getHomeRoute(session.role));

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true },
  });
  if (!user) redirect("/auth/signin");

  return (
    <CertShell userName={user.name} userEmail={user.email}>
      {children}
    </CertShell>
  );
}