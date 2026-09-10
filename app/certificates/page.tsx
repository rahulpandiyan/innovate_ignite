import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { IssueCertificateForm } from "@/components/certs/issue-certificate-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { humanizeType } from "@/lib/certificates";
import Link from "next/link";
import { FileBadge } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["CERTIFICATE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const [events, certificates] = await Promise.all([
    prisma.event.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.certificate.findMany({
      include: {
        participant: { include: { user: { select: { name: true } } } },
        college: { select: { name: true } },
        event: { select: { name: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
  ]);

  // Eligible participants: those with a CONFIRMED registration in the event.
  const confirmedRegs = await prisma.registration.findMany({
    where: { status: "CONFIRMED" },
    select: {
      eventId: true,
      user: { select: { id: true, name: true, collegeName: true } },
    },
  });
  const confirmedUserIds = [...new Set(confirmedRegs.map((r) => r.user.id))];
  const participantRows = await prisma.participant.findMany({
    where: { userId: { in: confirmedUserIds } },
    select: { id: true, userId: true },
  });
  const participantByUser = new Map(participantRows.map((p) => [p.userId, p.id]));
  const eligibleByEvent = new Map<string, { participantId: string; name: string; college: string }[]>();
  for (const reg of confirmedRegs) {
    const participantId = participantByUser.get(reg.user.id);
    if (!participantId) continue;
    const list = eligibleByEvent.get(reg.eventId) ?? [];
    list.push({
      participantId,
      name: reg.user.name,
      college: reg.user.collegeName ?? "—",
    });
    eligibleByEvent.set(reg.eventId, list);
  }

  const templates = await prisma.certificateTemplate.findMany({
    where: { isActive: true },
    select: { id: true, name: true, type: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue participation and winner certificates. Participants download these from their
          dashboard; each carries a public verification token.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileBadge className="h-4 w-4 text-muted-foreground" /> Issue certificate
            </CardTitle>
            <CardDescription>Pick an event, a participant and a certificate type.</CardDescription>
          </CardHeader>
          <CardContent>
            <IssueCertificateForm
              events={events.map((e) => ({ id: e.id, name: e.name }))}
              eligible={Object.fromEntries(eligibleByEvent)}
              templates={templates.map((t) => ({ id: t.id, name: t.name, type: t.type }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Issued certificates</CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Certificate</th>
                  <th className="px-4 py-2 font-medium">Participant</th>
                  <th className="px-4 py-2 font-medium">College</th>
                  <th className="px-4 py-2 font-medium">Event</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Issued</th>
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No certificates issued yet.
                    </td>
                  </tr>
                )}
                {certificates.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <Link
                        href={`/api/certificates/${c.certificateId}/download`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {c.certificateId}
                      </Link>
                    </td>
                    <td className="px-4 py-2 font-medium">{c.participant.user.name}</td>
                    <td className="px-4 py-2">{c.college.name}</td>
                    <td className="px-4 py-2">{c.event.name}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{humanizeType(c.type)}</Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {format(c.issuedAt, "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}