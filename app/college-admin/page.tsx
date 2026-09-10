import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { getCollegeIdForUser } from "@/lib/collegeAdmin";
import { EligibilityActions } from "@/components/college-admin/eligibility-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersRound, ClipboardList, BadgeCheck, IndianRupee, MapPin, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

function maskAadhar(value: string | null) {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `••••••${value.slice(-4)}`;
}

export default async function CollegeAdminPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["COLLEGE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const collegeId = await getCollegeIdForUser(session.id);
  if (!collegeId) redirect("/dashboard");

  const college = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!college) redirect("/dashboard");

  const participants = await prisma.participant.findMany({
    where: { collegeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          usn: true,
          collegeIdNumber: true,
          aadharNumber: true,
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const regs = await prisma.registration.findMany({
    where: { collegeId },
    include: {
      user: { select: { name: true } },
      event: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const regIds = regs.map((r) => r.id);
  const attendees = await prisma.attendee.findMany({
    where: { registrationId: { in: regIds } },
    select: { id: true, registrationId: true, status: true, qrPass: { select: { token: true } } },
  });
  const attendeeByReg = new Map(attendees.map((a) => [a.registrationId, a]));
  const attendeeIds = attendees.map((a) => a.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const attendance = await prisma.attendance.findMany({
    where: {
      attendeeId: { in: attendeeIds },
      checkedInAt: { gte: todayStart },
    },
    select: { attendeeId: true, eventId: true, status: true, checkedInAt: true },
  });
  const checkedIn = attendance.filter((a) => a.status === "CHECKED_IN").length;

  const payments = await prisma.payment.findMany({
    where: { registrationId: { in: regIds } },
    select: { registrationId: true, status: true, amount: true },
  });
  const paidCount = payments.filter((p) => p.status === "SUCCESS" || p.status === "REFUNDED").length;
  const paidAmount = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((s, p) => s + Number(p.amount), 0);
  const confirmedCount = regs.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{college.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            <Hash className="mr-1 h-3 w-3" /> Code {college.code}
          </Badge>
          {college.region && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {college.region}
            </span>
          )}
          {college.address && <span className="text-muted-foreground">{college.address}</span>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <UsersRound className="h-3 w-3" /> Participants
            </CardDescription>
            <CardTitle className="text-2xl">{participants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <ClipboardList className="h-3 w-3" /> Registrations
            </CardDescription>
            <CardTitle className="text-2xl">{regs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <BadgeCheck className="h-3 w-3" /> Confirmed
            </CardDescription>
            <CardTitle className="text-2xl">{confirmedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <IndianRupee className="h-3 w-3" /> Paid
            </CardDescription>
            <CardTitle className="text-2xl">
              ₹{paidAmount.toLocaleString("en-IN")}
              <span className="ml-1 text-sm font-normal text-muted-foreground">({paidCount})</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              Checked in today
            </CardDescription>
            <CardTitle className="text-2xl">{checkedIn}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participant roster</CardTitle>
          <CardDescription>Verified student identities from your college.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">USN</th>
                <th className="px-4 py-2 font-medium">College ID</th>
                <th className="px-4 py-2 font-medium">Aadhaar</th>
                <th className="px-4 py-2 font-medium">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No participants registered from this college yet.
                  </td>
                </tr>
              )}
              {participants.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">
                    {p.user.name}
                    <div className="text-xs text-muted-foreground">{p.participantId}</div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{p.user.email}</td>
                  <td className="px-4 py-2 font-mono text-xs">{p.user.usn ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{p.user.collegeIdNumber ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{maskAadhar(p.user.aadharNumber)}</td>
                  <td className="px-4 py-2">{p.user._count.registrations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrations & eligibility</CardTitle>
          <CardDescription>
            Verify document eligibility per confirmed registration. Attendees flagged ineligible are
            blocked from receiving QR passes.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Registration</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Attendee</th>
                <th className="px-4 py-2 font-medium">QR</th>
                <th className="px-4 py-2 font-medium">Checked in</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No registrations from this college yet.
                  </td>
                </tr>
              )}
              {regs.map((r) => {
                const att = attendeeByReg.get(r.id);
                const pay = payments.find((p) => p.registrationId === r.id);
                const today = att
                  ? attendance.some(
                      (a) => a.attendeeId === att.id && a.eventId === r.eventId && a.status === "CHECKED_IN"
                    )
                  : false;
                return (
                  <tr key={r.id} className="border-b last:border-0 align-top">
                    <td className="px-4 py-2 font-medium">{r.user.name}</td>
                    <td className="px-4 py-2">{r.event.name}</td>
                    <td className="px-4 py-2">
                      <div>{r.registrationId}</div>
                      <Badge variant={r.status === "CONFIRMED" ? "default" : "outline"}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {pay ? (
                        <>
                          <Badge variant={pay.status === "SUCCESS" ? "default" : "outline"}>{pay.status}</Badge>
                          <div className="mt-1 font-mono text-muted-foreground">
                            ₹{Number(pay.amount).toFixed(0)}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {att ? (
                        <Badge
                          variant={att.status === "VERIFIED" ? "default" : att.status === "INELIGIBLE" ? "destructive" : "outline"}
                        >
                          {att.status}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{att?.qrPass?.token ?? "—"}</td>
                    <td className="px-4 py-2 text-xs">{today ? "Yes" : "—"}</td>
                    <td className="px-4 py-2">
                      {att ? <EligibilityActions attendeeId={att.id} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}