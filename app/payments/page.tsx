import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { OrderActions } from "@/components/finance/order-actions";
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
        user: { select: { name: true, email: true } },
        orderItems: { select: { event: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.findMany({
      include: {
        registration: {
          include: {
            user: { select: { name: true } },
            event: { select: { name: true } },
          },
        },
        verifier: { select: { name: true } },
      },
      orderBy: { confirmedAt: "desc" },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reconcile submitted UPI payments. Verifying an order creates the registrations, QR
          passes and SUCCESS payment records automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
              <FileClock className="h-3 w-3" /> Awaiting verification
            </CardDescription>
            <CardTitle className="text-2xl">{pendingVerification}</CardTitle>
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
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-2 text-muted-foreground">
                    {format(o.createdAt, "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {o.user.name}
                    <div className="text-xs text-muted-foreground">{o.user.email}</div>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {o.orderItems.map((i) => i.event.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2 font-mono">₹{Number(o.totalAmount).toFixed(0)}</td>
                  <td className="px-4 py-2 text-xs font-mono">
                    {o.upiTransactionId ?? "—"}
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
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration payments</CardTitle>
          <CardDescription>Per-registration ledger created by verification.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Confirmed</th>
                <th className="px-4 py-2 font-medium">Verified by</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{p.registration.user.name}</td>
                  <td className="px-4 py-2">{p.registration.event.name}</td>
                  <td className="px-4 py-2 font-mono">₹{Number(p.amount).toFixed(0)}</td>
                  <td className="px-4 py-2">
                    <Badge variant={p.status === "SUCCESS" ? "default" : "outline"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {p.confirmedAt ? format(p.confirmedAt, "MMM d, h:mm a") : "—"}
                  </td>
                  <td className="px-4 py-2">{p.verifier?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}