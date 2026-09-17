import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TicketCheck,
  UsersRound,
  MailPlus,
  Receipt,
  Megaphone,
  ArrowRight,
  UserRound,
  CalendarDays,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { BadgeCheck } from "lucide-react";

function humanizeCertType(type: string): string {
  switch (type) {
    case "WINNER":
      return "Winner";
    case "RUNNER_UP":
      return "Runner-up";
    case "SPECIAL_RECOGNITION":
      return "Special recognition";
    default:
      return "Participation";
  }
}

function announcedToMe(
  announcements: {
    id: string;
    title: string;
    body: string;
    target: string;
    targetIds: unknown;
    publishedAt: Date | null;
  }[],
  ctx: { userId: string; collegeId: string | null; teamIds: string[]; eventIds: string[] }
) {
  const toSet = (raw: unknown) => (Array.isArray(raw) ? raw.map(String) : []);
  return announcements
    .filter((a) => {
      switch (a.target) {
        case "ALL":
          return true;
        case "EVENT":
          return toSet(a.targetIds).some((id) => ctx.eventIds.includes(id));
        case "COLLEGE":
          return ctx.collegeId ? toSet(a.targetIds).includes(ctx.collegeId) : false;
        case "TEAM":
          return toSet(a.targetIds).some((id) => ctx.teamIds.includes(id));
        case "USERS":
          return toSet(a.targetIds).includes(ctx.userId);
        default:
          return false;
      }
    })
    .sort((a, b) => (b.publishedAt ?? new Date(0)).getTime() - (a.publishedAt ?? new Date(0)).getTime())
    .slice(0, 5);
}

export default async function DashboardOverviewPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const [user, registrations, memberships, invites, orders, announcements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        collegeName: true,
        collegeId: true,
        participant: { select: { participantId: true } },
      },
    }),
    prisma.registration.findMany({
      where: { userId: session.id },
      select: { id: true, status: true },
    }),
    prisma.teamMember.findMany({
      where: { userId: session.id },
      select: { team: { select: { id: true } } },
    }),
    prisma.teamInvite.count({ where: { invitedUserId: session.id, status: "PENDING" } }),
    prisma.order.count({ where: { userId: session.id } }),
    prisma.announcement.findMany({
      select: { id: true, title: true, body: true, target: true, targetIds: true, publishedAt: true },
    }),
  ]);

  if (!user) redirect("/auth/signin");

  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const teamIds = memberships.map((m) => m.team.id);
  const regEventIds = await prisma.registration
    .findMany({ where: { userId: session.id }, select: { eventId: true } })
    .then((rows) => rows.map((r) => r.eventId));

  const [myParticipant, myTeamMemberRows, allResults] = await Promise.all([
    prisma.participant.findUnique({
      where: { userId: session.id },
      select: { id: true },
    }),
    prisma.teamMember.findMany({
      where: { userId: session.id },
      select: { teamId: true },
    }),
    prisma.result.findMany({
      where: { eventId: { in: regEventIds } },
      include: { event: { select: { name: true } } },
      orderBy: { declaredAt: "desc" },
      take: 30,
    }),
  ]);
  const myTeamIds = new Set(myTeamMemberRows.map((m) => m.teamId));
  const myResults = allResults.filter(
    (r) =>
      (r.teamId && myTeamIds.has(r.teamId)) ||
      (r.participantId && myParticipant && r.participantId === myParticipant.id)
  );

  const certificates =
    myParticipant && myParticipant.id
      ? await prisma.certificate.findMany({
          where: { participantId: myParticipant.id, isPublished: true },
          include: { event: { select: { name: true } } },
          orderBy: { issuedAt: "desc" },
        })
      : [];

  const visible = announcedToMe(announcements, {
    userId: session.id,
    collegeId: user.collegeId,
    teamIds,
    eventIds: regEventIds,
  });

  const stats = [
    { label: "Registrations", value: registrations.length, icon: TicketCheck, href: "/dashboard/registrations" },
    { label: "Confirmed", value: confirmed, icon: UsersRound, href: "/dashboard/registrations" },
    { label: "Teams", value: teamIds.length, icon: UsersRound, href: "/dashboard/teams" },
    { label: "Invites", value: invites, icon: MailPlus, href: "/dashboard/invites" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">
          Your participant dashboard for VVIT Innovate Ignite.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" /> Quick actions
          </CardTitle>
          <CardDescription>Browse and register for events.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/events">
              <CalendarDays className="mr-2 h-4 w-4" /> Browse all events
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/registrations">My registrations</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/teams">My teams</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates that apply to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements for you yet.</p>
            ) : (
              visible.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.publishedAt && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {format(a.publishedAt, "MMM d")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Identity
            </CardTitle>
            <CardDescription>Your records on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">College</span>
              <span className="font-medium">{user.collegeName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Participant ID</span>
              <Badge variant="outline">{user.participant?.participantId ?? "—"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Orders</span>
              <span className="font-medium">{orders}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/dashboard/profile">
                View profile <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {myResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersRound className="h-4 w-4 text-amber-500" /> Results
            </CardTitle>
            <CardDescription>Your standings in published events.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {myResults.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.event.name}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={r.winnerStatus === "WINNER" ? "default" : "outline"}>
                        {r.winnerStatus}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {r.rank ? `Rank #${r.rank}` : "—"}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {r.score !== null ? Number(r.score).toFixed(0) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="h-4 w-4 text-green-600" /> Certificates
            </CardTitle>
            <CardDescription>Download your official certificates.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{c.event.name}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{humanizeCertType(c.type)}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      Issued {format(c.issuedAt, "MMM d, yyyy")}
                    </td>
                    <td className="py-2 text-right">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/certificates/${c.certificateId}/download`}>
                          Download PDF
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}