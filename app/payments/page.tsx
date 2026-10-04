import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { RegistrationActions } from "@/components/finance/registration-actions";
import { UserContactDialog } from "@/components/finance/user-contact-dialog";
import { PaymentPreviewSheet } from "@/components/finance/payment-preview-sheet";
import { ExportExcelButton } from "@/components/ui/export-excel";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndianRupee, Wallet, RefreshCcw, FileClock, Search } from "lucide-react";
import { format } from "date-fns";
import { displayEventName, getGameChoice } from "@/lib/eventDisplay";
import {
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_STYLE,
  paymentStateOf,
} from "@/lib/paymentState";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COORDINATOR_COLLECTED",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
] as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["FINANCE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const sp = searchParams ? await searchParams : {};
  const q = (sp.q ?? "").trim();
  const statusFilter = sp.status && sp.status !== "ALL" ? sp.status : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  // One filter set drives the rows, the total and the export so the footer,
  // the row count and the spreadsheet can never disagree.
  const where: Prisma.PaymentWhereInput = {
    ...(q
      ? {
          OR: [
            { registration: { user: { name: { contains: q, mode: "insensitive" } } } },
            { registration: { user: { email: { contains: q, mode: "insensitive" } } } },
            { registration: { user: { phone: { contains: q, mode: "insensitive" } } } },
            { registration: { user: { collegeName: { contains: q, mode: "insensitive" } } } },
            {
              registration: {
                user: { participant: { participantId: { contains: q, mode: "insensitive" } } },
              },
            },
            { registration: { registrationId: { contains: q, mode: "insensitive" } } },
            { transactionId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter as never } : {}),
  };

  const include = {
    registration: {
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            collegeName: true,
            participant: { select: { participantId: true } },
          },
        },
        event: { select: { name: true } },
      },
    },
    verifier: { select: { name: true } },
    collector: { select: { name: true } },
  } as const;

  const [
    total,
    payments,
    allForExport,
    // Headline numbers come from the whole table, never from the visible page.
    successAgg,
    refundedAgg,
    successCount,
    pendingCount,
    coordinatorCollectedCount,
  ] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include,
      orderBy: { initiatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.payment.findMany({
      where,
      include,
      orderBy: { initiatedAt: "desc" },
    }),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "REFUNDED" }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "COORDINATOR_COLLECTED" } }),
  ]);

  const collected = Number(successAgg._sum.amount ?? 0);
  const refunded = Number(refundedAgg._sum.amount ?? 0);

  const paymentsExport = allForExport.map((p) => ({
    Initiated: format(p.initiatedAt, "yyyy-MM-dd HH:mm"),
    Participant: p.registration.user.name,
    Email: p.registration.user.email,
    Phone: p.registration.user.phone,
    College: p.registration.user.collegeName,
    ParticipantID: p.registration.user.participant?.participantId ?? "",
    Event: displayEventName(p.registration.event.name, p.registration.formResponses),
    Game: getGameChoice(p.registration.event.name, p.registration.formResponses) ?? "",
    Amount: Number(p.amount),
    Method: p.transactionId === "OFFLINE" ? "OFFLINE" : "UPI",
    TransactionID: p.transactionId ?? "",
    Screenshot: p.receiptUrl ?? "",
    Status: p.status,
    Approved: paymentStateOf(p.status) === "APPROVED" ? "Yes" : "No",
    ConfirmedAt: p.confirmedAt ? format(p.confirmedAt, "yyyy-MM-dd HH:mm") : "",
    CollectedBy: p.collector?.name ?? "",
    VerifiedBy: p.verifier?.name ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One row per registration payment. Verify a payment to confirm the registration. Use{" "}
          <span className="font-medium text-foreground">Participants</span> in the sidebar for the
          full list, including registrations with no payment record.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <Wallet className="h-3 w-3" /> Successful payments
            </CardDescription>
            <CardTitle className="text-2xl">{successCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1">
              <FileClock className="h-3 w-3" /> Pending
            </CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
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
              <RefreshCcw className="h-3 w-3" /> Refunded
            </CardDescription>
            <CardTitle className="text-2xl">₹{refunded.toLocaleString("en-IN")}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Registration payments</CardTitle>
              <CardDescription>
                {total} matching · {PER_PAGE} per page
              </CardDescription>
            </div>
            <ExportExcelButton
              data={paymentsExport}
              filename={`registration-payments-${format(new Date(), "yyyy-MM-dd")}`}
              sheetName="Payments"
              label={`Export ${paymentsExport.length}`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form
            method="GET"
            className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search participant, email, phone, registration ID or UTR…"
                className="h-9 pl-9"
                aria-label="Search payments"
              />
            </div>
            <Select name="status" defaultValue={statusFilter || "ALL"}>
              <SelectTrigger className="h-9 w-full sm:w-[230px]" aria-label="Filter by payment status">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any status</SelectItem>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-9">
                Search
              </Button>
              {(q || statusFilter) && (
                <Button asChild size="sm" variant="outline" className="h-9">
                  <a href="/payments">Reset</a>
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-2.5 py-2 font-medium">Initiated</th>
                  <th className="px-2.5 py-2 font-medium">Participant</th>
                  <th className="px-2.5 py-2 font-medium">Event</th>
                  <th className="px-2.5 py-2 font-medium">Amount</th>
                  <th className="px-2.5 py-2 font-medium">Payment</th>
                  <th className="px-2.5 py-2 font-medium">Evidence</th>
                  <th className="px-2.5 py-2 font-medium">Status</th>
                  <th className="px-2.5 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No payment matches your search.
                    </td>
                  </tr>
                )}
                {payments.map((p) => {
                  const isOffline = p.transactionId === "OFFLINE";
                  const state = paymentStateOf(p.status);
                  return (
                    <tr key={p.id} className="border-b last:border-0 align-top">
                      <td className="px-2.5 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {format(p.initiatedAt, "MMM d")}
                        <div className="text-[11px]">{format(p.initiatedAt, "h:mm a")}</div>
                      </td>
                      <td className="px-2.5 py-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[150px] truncate">{p.registration.user.name}</span>
                          <span className="shrink-0">
                            <UserContactDialog
                              user={{
                                name: p.registration.user.name,
                                email: p.registration.user.email,
                                phone: p.registration.user.phone,
                                collegeName: p.registration.user.collegeName,
                              }}
                              participantId={p.registration.user.participant?.participantId ?? null}
                              registrationId={p.registrationId}
                              eventName={displayEventName(p.registration.event.name, p.registration.formResponses)}
                            />
                          </span>
                        </div>
                        <div className="max-w-[180px] truncate text-xs font-normal text-muted-foreground">
                          {p.registration.user.email}
                        </div>
                        <a
                          href={`tel:${p.registration.user.phone}`}
                          className="block max-w-[180px] truncate text-xs font-mono font-normal text-[#2362EC] hover:underline"
                        >
                          {p.registration.user.phone}
                        </a>
                      </td>
                      <td className="px-2.5 py-2 text-xs">
                        <span className="line-clamp-2 max-w-[140px]">
                          {displayEventName(p.registration.event.name, p.registration.formResponses)}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 font-mono whitespace-nowrap">
                        ₹{Number(p.amount).toFixed(0)}
                      </td>
                      <td className="px-2.5 py-2">
                        {isOffline ? (
                          <Badge
                            variant="outline"
                            className="w-fit border-amber-200 bg-amber-50 text-[10px] text-amber-700"
                          >
                            OFFLINE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-fit text-[10px]">
                            UPI
                          </Badge>
                        )}
                        <div className="mt-1 max-w-[130px] truncate font-mono text-[11px] text-muted-foreground">
                          {p.transactionId && !isOffline ? p.transactionId : "No UTR"}
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <PaymentPreviewSheet
                          row={{
                            participant: p.registration.user.name,
                            email: p.registration.user.email,
                            phone: p.registration.user.phone,
                            college: p.registration.user.collegeName,
                            participantId: p.registration.user.participant?.participantId ?? "",
                            events: displayEventName(p.registration.event.name, p.registration.formResponses),
                            amount: Number(p.amount),
                            method: isOffline ? "OFFLINE" : "UPI",
                            upiId: isOffline ? null : p.transactionId,
                            screenshotUrl: p.receiptUrl,
                            status: p.status,
                            extra: [
                              { label: "Initiated", value: format(p.initiatedAt, "MMM d, yyyy h:mm a") },
                              { label: "Collected by", value: p.collector?.name ?? "" },
                              { label: "Verified by", value: p.verifier?.name ?? "" },
                            ],
                          }}
                          actions={
                            p.status === "PENDING" || p.status === "COORDINATOR_COLLECTED" ? (
                              <RegistrationActions
                                registrationId={p.registrationId}
                                paymentId={p.id}
                                paymentStatus={p.status}
                              />
                            ) : undefined
                          }
                        />
                      </td>
                      <td className="px-2.5 py-2">
                        <Badge variant="outline" className={`w-fit ${PAYMENT_STATE_STYLE[state]}`}>
                          {PAYMENT_STATE_LABEL[state]}
                        </Badge>
                        <div className="mt-1 max-w-[130px] truncate text-[11px] text-muted-foreground">
                          {p.status.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        {p.status === "PENDING" || p.status === "COORDINATOR_COLLECTED" ? (
                          <RegistrationActions
                            registrationId={p.registrationId}
                            paymentId={p.id}
                            paymentStatus={p.status}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <PaginationNav
              baseUrl="/payments"
              page={page}
              perPage={PER_PAGE}
              total={total}
              params={{ q, status: statusFilter }}
              noun="payments"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}