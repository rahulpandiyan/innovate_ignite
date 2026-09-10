import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { JudgeShell } from "@/components/judge/judge-shell";

const ALLOWED = new Set(["JUDGE", "SUPER_ADMIN"]);

export default async function JudgeLayout({
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
    <JudgeShell userName={user.name} userEmail={user.email}>
      {children}
    </JudgeShell>
  );
}