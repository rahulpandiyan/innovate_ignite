import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getEventScope } from "@/lib/rbac";
import { getHomeRoute } from "@/lib/rbac-data";
import { CoordinatorShell } from "@/components/coordinator/coordinator-shell";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.role !== "EVENT_COORDINATOR" && session.role !== "SUPER_ADMIN") {
    redirect(getHomeRoute(session.role));
  }

  const [user, scope] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    }),
    getEventScope(session.id),
  ]);

  if (!user) {
    redirect("/auth/signin");
  }

  const events = await prisma.event.findMany({
    where: scope === null ? {} : { id: { in: scope } },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <CoordinatorShell
      userName={user.name}
      userEmail={user.email}
      events={events}
      isGlobalScope={scope === null}
    >
      {children}
    </CoordinatorShell>
  );
}