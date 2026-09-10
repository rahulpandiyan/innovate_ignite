import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { FinanceShell } from "@/components/finance/finance-shell";

const ALLOWED = new Set(["FINANCE_ADMIN", "SUPER_ADMIN"]);

export default async function PaymentsLayout({
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
    <FinanceShell userName={user.name} userEmail={user.email}>
      {children}
    </FinanceShell>
  );
}