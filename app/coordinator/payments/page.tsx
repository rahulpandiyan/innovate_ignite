import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getEventScope } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegistrationActions } from "@/components/finance/registration-actions";
import { IndianRupee, HandCoins, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CoordinatorPaymentsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const scope = await getEventScope(session.id);

  const payments = await prisma.payment.findMany({
    where: {
      registration: {
        eventId: scope === null ? undefined : { in: scope },
      },
    },
    include: {
      registration: {
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { name: true } },
        },
      },
      collector: { select: { name: true } },
      verifier: { select: { name: true } },
    },
    orderBy: { initiatedAt: "desc" },
    take: 200,
  });

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const coordinatorCollected = payments.filter((p) => p.status === "COORDINATOR_COLLECTED");
  const verifiedPayments = payments.filter((p) => p.status === "SUCCESS");
  const totalCollected = coordinatorCollected.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Collect payments</h1>
        <p className="text-muted-foreground">
          Mark payments as collected from students. Finance will verify and confirm.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending collection
            </CardDescription>
            <CardTitle className="text-2xl">{pendingPayments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <HandCoins className="h-3 w-3" /> Collected by you
            </CardDescription>
            <CardTitle className="text-2xl">{coordinatorCollected.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </CardDescription>
            <CardTitle className="text-2xl">{verifiedPayments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> Amount collected
            </CardDescription>
            <CardTitle className="text-2xl">₹{totalCollected.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending payments</CardTitle>
          <CardDescription>Click &quot;Collect&quot; to mark a payment as received from the student.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No pending payments to collect.
                  </td>
                </tr>
              )}
              {pendingPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">
                    {p.registration.user.name}
                    <div className="text-xs text-muted-foreground">{p.registration.user.email}</div>
                  </td>
                  <td className="px-4 py-2">{p.registration.event.name}</td>
                  <td className="px-4 py-2 font-mono">₹{Number(p.amount).toFixed(0)}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">Cash / UPI</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <RegistrationActions
                      registrationId={p.registrationId}
                      paymentId={p.id}
                      paymentStatus={p.status}
                      onCollect={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {coordinatorCollected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Awaiting finance verification</CardTitle>
            <CardDescription>Payments you have collected, pending finance verification.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Student</th>
                  <th className="px-4 py-2 font-medium">Event</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Collected at</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coordinatorCollected.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{p.registration.user.name}</td>
                    <td className="px-4 py-2">{p.registration.event.name}</td>
                    <td className="px-4 py-2 font-mono">₹{Number(p.amount).toFixed(0)}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {p.collectedAt ? format(p.collectedAt, "MMM d, h:mm a") : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="secondary">Awaiting verification</Badge>
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
