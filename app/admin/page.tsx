import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/authCookie";
import { redirect } from "next/navigation";
import { SectionCards, type SectionCard } from "@/components/admin/section-cards";
import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive";
import { DataTable, type RegistrationRow } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getAuthSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/auth/signin");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    colleges,
    collegesThisMonth,
    events,
    eventsOpen,
    registrations,
    regsThisMonth,
    pendingRegs,
    paymentsAgg,
    paymentsLast30,
    recentRegs,
    dailyRaw,
  ] = await Promise.all([
    prisma.college.count(),
    prisma.college.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.registration.count(),
    prisma.registration.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.registration.count({ where: { status: "PENDING" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", initiatedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        event: { select: { name: true } },
      },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Registration"
      WHERE "createdAt" >= now() - interval '90 days'
      GROUP BY 1 ORDER BY 1
    `,
  ]);

  const revenue = Number(paymentsAgg._sum.amount ?? 0);
  const revenueLast30 = Number(paymentsLast30._sum?.amount ?? 0);
  const revenueDelta =
    revenueLast30 > 0
      ? ((revenue - revenueLast30) / revenueLast30) * 100
      : revenue > 0
        ? 100
        : 0;

  const inr = (n: number) =>
    n === 0
      ? "₹0"
      : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const cards: SectionCard[] = [
    {
      label: "Total Revenue",
      value: inr(revenue),
      badge: `${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}%`,
      trend: revenueDelta < 0 ? "down" : "up",
      footerTitle:
        revenueDelta === 0
          ? "No verified payments yet"
          : revenueDelta < 0
            ? "Down this month"
            : "Growing month over month",
      footerSub: "Confirmed via order pipeline",
    },
    {
      label: "Registrations",
      value: registrations.toLocaleString(),
      badge: `+${regsThisMonth}`,
      trend: "up",
      footerTitle: `+${regsThisMonth} this month`,
      footerSub: `${pendingRegs} pending approval`,
    },
    {
      label: "Colleges",
      value: colleges.toLocaleString(),
      badge: `+${collegesThisMonth}`,
      trend: "up",
      footerTitle: `+${collegesThisMonth} this month`,
      footerSub: "Partner institutions onboarded",
    },
    {
      label: "Events",
      value: events.toLocaleString(),
      badge: `${eventsOpen} live`,
      trend: "up",
      footerTitle: `${eventsOpen} accepting entries`,
      footerSub: "This season's public lineup",
    },
  ];

  const chartData = Array.from({ length: 90 }).map((_, i) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (89 - i));
    const found = dailyRaw.find(
      (r) => new Date(r.day).toDateString() === d.toDateString()
    );
    return {
      date: d.toISOString(),
      registrations: found ? Number(found.count) : 0,
    };
  });

  const rows: RegistrationRow[] = recentRegs.map((reg) => ({
    id: reg.id,
    name: reg.user.name,
    email: reg.user.email,
    event: reg.event.name,
    status: reg.status,
    createdAt: reg.createdAt.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <>
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.email.split("@")[0]}. Here&apos;s an overview
            of the platform.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <SectionCards cards={cards} />
        <ChartAreaInteractive data={chartData} />
      </div>

      <DataTable rows={rows} />
    </>
  );
}