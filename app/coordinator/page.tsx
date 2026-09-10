import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getEventScope } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, UsersRound, CheckCheck, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default async function CoordinatorOverviewPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const scope = await getEventScope(session.id);
  const events = await prisma.event.findMany({
    where: scope === null ? {} : { id: { in: scope } },
    include: {
      registrations: {
        select: { id: true, status: true, attendees: { select: { id: true, attendance: { select: { id: true } } } } },
      },
      _count: { select: { teams: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My events</h1>
        <p className="text-muted-foreground">
          {scope === null
            ? "You have full platform visibility."
            : `You are a coordinator for ${events.length} event${events.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No assigned events</CardTitle>
            <CardDescription>
              A Super Admin assigns coordinators to events. Check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => {
            const total = ev.registrations.length;
            const pending = ev.registrations.filter((r) => r.status === "PENDING").length;
            const checkedIn = ev.registrations.reduce(
              (sum, r) => sum + r.attendees.filter((a) => a.attendance.length > 0).length,
              0
            );
            return (
              <Card key={ev.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {ev.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {ev.date ? format(ev.date, "MMM d, yyyy") : "Date TBA"}
                        {ev.venue ? ` · ${ev.venue}` : ""}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{ev.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UsersRound className="h-3.5 w-3.5" /> Registrations
                      </div>
                      <div className="mt-1 text-xl font-semibold">{total}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </div>
                      <div className="mt-1 text-xl font-semibold">{pending}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCheck className="h-3.5 w-3.5" /> Checked in
                      </div>
                      <div className="mt-1 text-xl font-semibold">{checkedIn}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UsersRound className="h-3.5 w-3.5" /> Teams
                      </div>
                      <div className="mt-1 text-xl font-semibold">{ev._count.teams}</div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/coordinator/${ev.id}`}>
                      View event <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}