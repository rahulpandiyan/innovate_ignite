import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { UserContactDialog } from "@/components/finance/user-contact-dialog";
import { ExportExcelButton } from "@/components/ui/export-excel";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { ParticipantDetailSheet } from "@/components/admin/participant-detail-sheet";
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
import { Clock, IndianRupee, Search, ShieldCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { displayEventName } from "@/lib/eventDisplay";
import {
  PAYMENT_FILTERS,
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_STYLE,
  paymentStateOf,
  paymentStateWhere,
} from "@/lib/paymentState";
import {
  participantExportRows,
  participantInclude,
  toParticipantDetail,
} from "@/lib/participantRows";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const;

/**
 * Every registration, whether or not a payment exists. The ledger only shows
 * rows that have a Payment, so this is where finance sees the full cohort.
 */
export default async function FinanceParticipantsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    event?: string;
    pay?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["FINANCE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const sp = searchParams ? await searchParams : {};
  const q = (sp.q ?? "").trim();
  const eventFilter = sp.event && sp.event !== "ALL" ? sp.event : "";
  const payFilter = sp.pay && sp.pay !== "ALL" ? sp.pay : "";
  const statusFilter = sp.status && sp.status !== "ALL" ? sp.status : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  // One filter set drives the rows, the card totals and the export.
  const where: Prisma.RegistrationWhereInput = {
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
            { user: { collegeName: { contains: q, mode: "insensitive" } } },
            { user: { participant: { participantId: { contains: q, mode: "insensitive" } } } },
            { registrationId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(eventFilter ? { eventId: eventFilter } : {}),
    ...(statusFilter ? { status: statusFilter as never } : {}),
    ...paymentStateWhere(payFilter),
  };

  const [total, registrations, events, counts, allForExport] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      include: participantInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.event.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    Promise.all([
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("approved") } }),
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("pending") } }),
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("unpaid") } }),
    ]),
    prisma.registration.findMany({
      where,
      include: participantInclude,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [approvedCount, pendingCount, unpaidCount] = counts;
  const hasFilter = Boolean(q || eventFilter || payFilter || statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Participants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every registration across all events, whether or not a payment was made. Use this to
          reconcile who registered against what the{" "}
          <span className="font-medium text-foreground">Payment ledger</span> has collected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <IndianRupee className="h-3 w-3" /> {hasFilter ? "Matching rows" : "Registrations"}
            </CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" /> Payment approved
            </CardDescription>
            <CardTitle className="text-2xl">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" /> Payment pending
            </CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <UserX className="h-3 w-3" /> No payment yet
            </CardDescription>
            <CardTitle className="text-2xl">{unpaidCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Registrations</CardTitle>
              <CardDescription>
                {hasFilter ? `${total} matching` : `${total} total`} · {PER_PAGE} per page
              </CardDescription>
            </div>
            <ExportExcelButton
              data={participantExportRows(allForExport)}
              filename={`participants-${format(new Date(), "yyyy-MM-dd")}`}
              sheetName="Participants"
              label={`Export ${allForExport.length}`}
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
                placeholder="Search participant, email, phone or participant ID…"
                className="h-9 pl-9"
                aria-label="Search participants"
              />
            </div>
            <Select name="event" defaultValue={eventFilter || "ALL"}>
              <SelectTrigger className="h-9 w-full sm:w-[210px]" aria-label="Filter by event">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All events</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="pay" defaultValue={payFilter || "ALL"}>
              <SelectTrigger className="h-9 w-full sm:w-[190px]" aria-label="Filter by payment status">
                <SelectValue placeholder="Any payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any payment</SelectItem>
                {PAYMENT_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="status" defaultValue={statusFilter || "ALL"}>
              <SelectTrigger className="h-9 w-full sm:w-[190px]" aria-label="Filter by registration status">
                <SelectValue placeholder="Any registration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any registration</SelectItem>
                {REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-9">
                Search
              </Button>
              {hasFilter && (
                <Button asChild size="sm" variant="outline" className="h-9">
                  <a href="/payments/participants">Reset</a>
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Participant</th>
                  <th className="px-4 py-2 font-medium">Event</th>
                  <th className="px-4 py-2 font-medium">Payment</th>
                  <th className="px-4 py-2 font-medium">Approved</th>
                  <th className="px-4 py-2 font-medium">Registration</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Registered</th>
                  <th className="px-4 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No participant matches your search.
                    </td>
                  </tr>
                )}
                {registrations.map((r) => {
                  const state = paymentStateOf(r.payment?.status, r.status);
                  return (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="px-4 py-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{r.user.name}</span>
                          <UserContactDialog
                            user={{
                              name: r.user.name,
                              email: r.user.email,
                              phone: r.user.phone,
                              collegeName: r.user.collegeName,
                            }}
                            participantId={r.user.participant?.participantId ?? null}
                            registrationId={r.registrationId}
                            eventName={displayEventName(r.event.name, r.formResponses)}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">{r.user.email}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {r.user.participant?.participantId ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div>{displayEventName(r.event.name, r.formResponses)}</div>
                        {r.team?.name && <div className="text-muted-foreground">Team: {r.team.name}</div>}
                      </td>
                      <td className="px-4 py-2">
                        {r.payment ? (
                          <>
                            <Badge variant="outline" className="text-[10px]">
                              {r.payment.status.replace(/_/g, " ")}
                            </Badge>
                            {r.payment.transactionId && (
                              <div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                                {r.payment.transactionId}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No payment record</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className={PAYMENT_STATE_STYLE[state]}>
                          {PAYMENT_STATE_LABEL[state]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="text-[10px]">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 font-mono">
                        {r.payment ? `₹${Number(r.payment.amount).toFixed(0)}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">
                        {format(r.createdAt, "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-2">
                        <ParticipantDetailSheet row={toParticipantDetail(r)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <PaginationNav
              baseUrl="/payments/participants"
              page={page}
              perPage={PER_PAGE}
              total={total}
              params={{ q, event: eventFilter, pay: payFilter, status: statusFilter }}
              noun="participants"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}