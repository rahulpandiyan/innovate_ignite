import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { OrderActions } from "@/components/finance/order-actions";
import { RegistrationActions } from "@/components/finance/registration-actions";
import { UserContactDialog } from "@/components/finance/user-contact-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Wallet, RefreshCcw, FileClock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["FINANCE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true, collegeName: true, participant: { select: { participantId: true } } } },
        orderItems: { select: { event: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.findMany({
      include: {
        registration: {
          include: {
            user: { select: { name: true, email: true, phone: true, collegeName: true, participant: { select: { participantId: true } } } },
            event: { select: { name: true } },
          },
        },
        verifier: { select: { name: true } },
        collector: { select: { name: true } },
      },
      orderBy: { initiatedAt: "desc" },
      take: 100,
    }),
  ]);

  const collected = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((s, p) => s + Number(p.amount), 0);
  const refunded = payments
    .filter((p) => p.status === "REFUNDED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingVerification = orders.filter((o) => o.status === "PAYMENT_SUBMITTED").length;
  const collectedCount = payments.filter((p) => p.status === "SUCCESS").length;
  const pendingRegPayments = payments.filter((p) => p.status === "PENDING").length;
  const coordinatorCollected = payments.filter((p) => p.status === "COORDINATOR_COLLECTED");
  const coordinatorCollectedCount = coordinatorCollected.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reconcile submitted UPI payments. Verifying an order creates the registrations, QR
          passes and SUCCESS payment records automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> Collected
            </CardDescription>
            <CardTitle className="text-2xl">₹{collected.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <FileClock className="h-3 w-3" /> Orders pending
            </CardDescription>
            <CardTitle className="text-2xl">{pendingVerification}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <FileClock className="h-3 w-3" /> Reg. payments pending
            </CardDescription>
            <CardTitle className="text-2xl">{pendingRegPayments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> Coordinator collected
            </CardDescription>
            <CardTitle className="text-2xl">{coordinatorCollectedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Successful payments
            </CardDescription>
            <CardTitle className="text-2xl">{collectedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <RefreshCcw className="h-3 w-3" /> Refunded
            </CardDescription>
            <CardTitle className="text-2xl">₹{refunded.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
          <CardDescription>Payment submissions from participants.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Events</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">UPI txn</th>
                <th className="px-4 py-2 font-medium">Screenshot</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((o) => {
                const isOffline = o.upiTransactionId === "OFFLINE";
                return (
                  <tr key={o.id} className="border-b last:border-0 align-top">
                    <td className="px-4 py-2 text-muted-foreground">
                      {format(o.createdAt, "MMM d, h:mm a")}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{o.user.name}</span>
                        <UserContactDialog
                          user={{ name: o.user.name, email: o.user.email, phone: o.user.phone, collegeName: o.user.collegeName }}
                          participantId={o.user.participant?.participantId ?? null}
                          eventName={o.orderItems.map((i) => i.event.name).join(", ")}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{o.user.email}</div>
                      <a href={`tel:${o.user.phone}`} className="text-xs font-mono text-[#2362EC] hover:underline">
                        {o.user.phone}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {o.orderItems.map((i) => i.event.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2 font-mono">₹{Number(o.totalAmount).toFixed(0)}</td>
                    <td className="px-4 py-2 text-xs font-mono">
                      {isOffline ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">OFFLINE</Badge>
                      ) : (
                        o.upiTransactionId ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {o.paymentScreenshotUrl ? (
                        <a
                          href={o.paymentScreenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={o.status === "VERIFIED" ? "default" : "outline"}>{o.status}</Badge>
                      {o.rejectionReason && (
                        <div className="mt-1 max-w-[160px] text-xs text-red-600">{o.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {o.status === "PAYMENT_SUBMITTED" ? (
                        <OrderActions orderId={o.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration payments</CardTitle>
          <CardDescription>Per-registration ledger. Verify to confirm registrations.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Confirmed</th>
                <th className="px-4 py-2 font-medium">Collected by</th>
                <th className="px-4 py-2 font-medium">Verified by</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {payments.map((p) => {
                const isOffline = p.transactionId === "OFFLINE";
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{p.registration.user.name}</span>
                        <UserContactDialog
                          user={{
                            name: p.registration.user.name,
                            email: p.registration.user.email,
                            phone: p.registration.user.phone,
                            collegeName: p.registration.user.collegeName,
                          }}
                          participantId={p.registration.user.participant?.participantId ?? null}
                          registrationId={p.registrationId}
                          eventName={p.registration.event.name}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{p.registration.user.email}</div>
                      <a href={`tel:${p.registration.user.phone}`} className="text-xs font-mono text-[#2362EC] hover:underline">
                        {p.registration.user.phone}
                      </a>
                    </td>
                    <td className="px-4 py-2">{p.registration.event.name}</td>
                    <td className="px-4 py-2 font-mono">₹{Number(p.amount).toFixed(0)}</td>
                    <td className="px-4 py-2">
                      {isOffline ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">OFFLINE</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">UPI</span>
                      )}
                      {p.receiptUrl && (
                        <div className="mt-1">
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 underline underline-offset-2 hover:text-blue-800"
                          >
                            Screenshot
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={p.status === "SUCCESS" ? "default" : p.status === "COORDINATOR_COLLECTED" ? "secondary" : "outline"}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {p.confirmedAt ? format(p.confirmedAt, "MMM d, h:mm a") : "—"}
                    </td>
                    <td className="px-4 py-2">{p.collector?.name ?? "—"}</td>
                    <td className="px-4 py-2">{p.verifier?.name ?? "—"}</td>
                    <td className="px-4 py-2">
                      {(p.status === "PENDING" || p.status === "COORDINATOR_COLLECTED") ? (
                        <RegistrationActions registrationId={p.registrationId} paymentId={p.id} paymentStatus={p.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
