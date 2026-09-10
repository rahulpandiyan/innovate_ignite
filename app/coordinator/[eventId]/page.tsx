import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { assertEventScope } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AnnouncementForm } from "@/components/coordinator/announcement-form";
import { PublishResultsButton } from "@/components/coordinator/publish-results-button";
import { getEventStandings } from "@/lib/judging";
import {
  Megaphone,
  UsersRound,
  Building2,
  TicketCheck,
  Check,
  Clock,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

type PageProps = { params: Promise<{ eventId: string }> };

export default async function CoordinatorEventPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  const { eventId } = await params;

  const denied = await assertEventScope(session.id, "registrations.view", eventId);
  if (denied) notFound();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          user: { select: { id: true, name: true, email: true, collegeName: true } },
          team: { select: { id: true, name: true } },
          payment: { select: { status: true, amount: true } },
          attendees: {
            select: { id: true, attendeeId: true, attendance: { select: { id: true, checkedInAt: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      coordinators: { include: { user: { select: { name: true, email: true } } } },
      judges: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { teams: true } },
    },
  });

  if (!event) notFound();

  const announcements = await prisma.announcement.findMany({
    where: { OR: [{ target: "ALL" }, { target: "EVENT", targetIds: { array_contains: eventId } }] },
    select: { id: true, title: true, body: true, publishedAt: true, createdBy: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const standings = await getEventStandings(eventId);

  const confirmed = event.registrations.filter((r) => r.status === "CONFIRMED").length;
  const pending = event.registrations.filter((r) => r.status === "PENDING").length;
  const checkedIn = event.registrations.reduce(
    (s, r) => s + r.attendees.filter((a) => a.attendance.length > 0).length,
    0
  );

  const byCollege = new Map<string, number>();
  for (const r of event.registrations) {
    const key = r.user.collegeName ?? "Unknown";
    byCollege.set(key, (byCollege.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground">
            {event.category} · {event.type} · {event.venue ?? "Venue TBA"} ·{" "}
            {event.date ? format(event.date, "MMM d, yyyy") : "Date TBA"}
          </p>
        </div>
        <Badge variant="outline">{event.status}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Registrations" value={event.registrations.length} icon={TicketCheck} />
            <StatCard label="Confirmed" value={confirmed} icon={Check} />
            <StatCard label="Pending" value={pending} icon={Clock} />
            <StatCard label="Checked in" value={checkedIn} icon={UsersRound} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event configuration</CardTitle>
              <CardDescription>Read-only config for this event.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ConfigRow label="Price" value={`₹${event.price.toString()}`} />
              <ConfigRow label="Registration type" value={event.type} />
              <ConfigRow label="Team size" value={`${event.minTeamSize ?? "—"} – ${event.maxTeamSize ?? "∞"}`} />
              <ConfigRow label="Venue" value={event.venue ?? "—"} />
              <ConfigRow label="Date" value={event.date ? format(event.date, "MMM d, yyyy") : "—"} />
              <ConfigRow label="Time" value={event.time ?? "—"} />
              <ConfigRow label="Coordinator(s)" value={event.coordinators.map((c) => c.user.name).join(", ") || "—"} />
              <ConfigRow label="Judge(s)" value={event.judges.map((j) => j.user.name).join(", ") || "—"} />
            </CardContent>
          </Card>

          {event.rules && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.rules}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Registrations ({event.registrations.length})
              </CardTitle>
              <CardDescription>All registered participants for this event.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.registrations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No registrations yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {event.registrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{r.registrationId}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{r.user.name}</div>
                        <div className="text-xs text-muted-foreground">{r.user.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{r.user.collegeName}</TableCell>
                      <TableCell className="text-sm">{r.team?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.payment?.status ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> By college
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...byCollege.entries()].map(([college, count]) => (
                  <div key={college} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <span>{college}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {byCollege.size === 0 && (
                  <p className="text-sm text-muted-foreground">No data.</p>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UsersRound className="h-4 w-4 text-muted-foreground" /> Participants
                </CardTitle>
                <CardDescription>Individual attendee records and check-in state.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Checked in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.registrations.flatMap((r) =>
                      r.attendees.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">{a.attendeeId}</TableCell>
                          <TableCell className="text-sm">{r.user.name}</TableCell>
                          <TableCell className="text-sm">
                            {a.attendance.length > 0
                              ? format(a.attendance[0].checkedInAt ?? new Date(), "MMM d, h:mm a")
                              : "Not checked in"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {event.registrations.every((r) => r.attendees.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                          No attendees issued QR passes yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Megaphone className="h-4 w-4 text-muted-foreground" /> New announcement
                </CardTitle>
                <CardDescription>
                  Sent to everyone registered for this event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnnouncementForm eventId={event.id} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No announcements for this event yet.
                  </p>
                ) : (
                  announcements.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{a.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {a.publishedAt ? format(a.publishedAt, "MMM d") : ""} · {a.createdBy.name}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      <TabsContent value="results">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Trophy className="h-4 w-4 text-muted-foreground" /> Results
                    </CardTitle>
                    <CardDescription>
                      Standings from finalised judge scores. Publishing makes them visible to
                      participants.
                    </CardDescription>
                  </div>
                  <PublishResultsButton
                    eventId={event.id}
                    hasResults={standings.published.length > 0}
                  />
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Judges scored</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Published status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.entries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          No confirmed entries yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {standings.entries.map((entry, index) => {
                      const published = standings.published.find(
                        (p) => p.rank === index + 1
                      );
                      return (
                        <TableRow key={entry.entryId}>
                          <TableCell className="text-sm font-medium">{index + 1}</TableCell>
                          <TableCell className="flex items-center gap-2 text-sm font-medium">
                            {entry.name}
                            <span className="text-xs text-muted-foreground">{entry.kind}</span>
                          </TableCell>
                          <TableCell className="text-sm">{entry.college}</TableCell>
                          <TableCell className="text-sm">{entry.scores.length} / {standings.judges.length}</TableCell>
                          <TableCell className="text-sm font-mono font-semibold">
                            {entry.scores.length > 0 ? entry.total : "—"}
                          </TableCell>
                          <TableCell>
                            {published ? (
                              <Badge variant={published.winnerStatus === "WINNER" ? "default" : "outline"}>
                                {published.winnerStatus}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not published</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">{value}</div>
    </div>
  );
}