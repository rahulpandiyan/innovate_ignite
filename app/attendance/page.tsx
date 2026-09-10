import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { assertPermission, getEventScope } from "@/lib/rbac";
import { getHomeRoute } from "@/lib/rbac-data";
import { ScanBox } from "@/components/attendance/scan-box";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const denied = await assertPermission(session.id, "attendance.view");
  if (denied) redirect(getHomeRoute(session.role));

  // Attendance staff are venue-wide; coordinators/admins are scoped to their events.
  const scope =
    session.role === "ATTENDANCE_STAFF"
      ? null
      : await getEventScope(session.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: {
      checkedInAt: { gte: startOfDay },
      ...(scope && scope.length > 0
        ? { eventId: { in: scope } }
        : {}),
    },
    include: {
      event: { select: { name: true, id: true } },
      attendee: {
        include: {
          registration: {
            select: {
              user: { select: { name: true, email: true, collegeName: true } },
            },
          },
        },
      },
    },
    orderBy: { checkedInAt: "desc" },
  });

  const byEvent = new Map<string, { name: string; total: number; checked: number }>();
  for (const r of records) {
    const key = r.event.id;
    const entry = byEvent.get(key) ?? {
      name: r.event.name,
      total: 0,
      checked: 0,
    };
    entry.total += 1;
    if (r.status === "CHECKED_IN") entry.checked += 1;
    byEvent.set(key, entry);
  }
  const byEventList = [...byEvent.values()].sort((a, b) => b.checked - a.checked);
  const checkedInToday = records.filter((r) => r.status === "CHECKED_IN").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Attendance desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan participant QR passes to check them in and out for an event. Scans are scoped to the
          events you&apos;re assigned to.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <UsersRound className="h-3 w-3" /> Checked in today
            </CardDescription>
            <CardTitle className="text-2xl">{checkedInToday}</CardTitle>
          </CardHeader>
        </Card>
        {byEventList.slice(0, 3).map((e) => (
          <Card key={e.name}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{e.name}</CardDescription>
              <CardTitle className="text-2xl">
                {e.checked}
                <span className="text-sm font-normal text-muted-foreground"> / {e.total}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <ScanBox />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s scans</CardTitle>
          <CardDescription>Most recent first</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scans recorded today yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">College</th>
                    <th className="pb-2 pr-4 font-medium">Event</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">
                        {r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-2 pr-4 font-medium">
                        {r.attendee.registration.user.name}
                      </td>
                      <td className="py-2 pr-4">{r.attendee.registration.user.collegeName}</td>
                      <td className="py-2 pr-4">{r.event.name}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={r.status === "CHECKED_IN" ? "default" : "outline"}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}