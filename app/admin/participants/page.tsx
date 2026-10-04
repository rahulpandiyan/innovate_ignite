import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExportExcelButton } from "@/components/ui/export-excel";
import { PaginationNav } from "@/components/ui/pagination-nav";
import {
  ParticipantDetailSheet,
} from "@/components/admin/participant-detail-sheet";
import {
  participantExportRows,
  participantInclude,
  toParticipantDetail,
} from "@/lib/participantRows";
import { IndianRupee, Search, ShieldCheck, Clock, UserX } from "lucide-react";
import { format } from "date-fns";
import {
  PAYMENT_FILTERS,
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_STYLE,
  paymentStateOf,
  paymentStateWhere,
} from "@/lib/paymentState";
import { displayEventName } from "@/lib/eventDisplay";

const PER_PAGE = 15;

const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const;

export default async function ParticipantsPage({
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
  const sp = searchParams ? await searchParams : {};
  const q = (sp.q ?? "").trim();
  const eventFilter = sp.event && sp.event !== "ALL" ? sp.event : "";
  const payFilter = sp.pay && sp.pay !== "ALL" ? sp.pay : "";
  const statusFilter = sp.status && sp.status !== "ALL" ? sp.status : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  // One filter set drives the rows, the totals and the export so they can
  // never disagree.
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

  const include = participantInclude;

  const [total, registrations, events, counts, allForExport] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.event.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    // Card totals respect the same filters as the table.
    Promise.all([
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("approved") } }),
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("pending") } }),
      prisma.registration.count({ where: { ...where, ...paymentStateWhere("unpaid") } }),
    ]),
    prisma.registration.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [approvedCount, pendingCount, unpaidCount] = counts;
  const hasFilter = Boolean(q || eventFilter || payFilter || statusFilter);
  const params = {
    q,
    event: eventFilter,
    pay: payFilter,
    status: statusFilter,
  };

  const eventName = (r: (typeof registrations)[number]) =>
    displayEventName(r.event.name, r.formResponses);

  const participantsExport = participantExportRows(allForExport);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Participants</h1>
        <p className="text-sm text-muted-foreground">
          Everyone registered for an event, which event they are in, and whether the payment is
          approved. Click Details for the full record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
                {hasFilter ? `${total} matching` : `${total} total`} · page {page} of{" "}
                {Math.max(1, Math.ceil(total / PER_PAGE))} · {PER_PAGE} per page
              </CardDescription>
            </div>
            <ExportExcelButton
              data={participantsExport}
              filename={`participants-${format(new Date(), "yyyy-MM-dd")}`}
              sheetName="Participants"
              label={`Export ${participantsExport.length}`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form method="GET" className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search participant, email, phone, participant ID or registration ID…"
                  className="pl-9"
                  aria-label="Search participants"
                />
              </div>
              <Select name="event" defaultValue={eventFilter || "ALL"}>
                <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filter by event">
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
                <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by payment status">
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
                <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by registration status">
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
                    <a href="/admin/participants">Reset</a>
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Participant</th>
                  <th className="px-3 py-2 font-medium">Event</th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">Registration</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Registered</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      No participant matches your search.
                    </td>
                  </tr>
                )}
                {registrations.map((r) => {
                  const state = paymentStateOf(r.payment?.status, r.status);
                  return (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="px-3 py-2 font-medium">
                        <div className="truncate">{r.user.name}</div>
                        <div className="truncate text-xs font-normal text-muted-foreground">
                          {r.user.email}
                        </div>
                        <div className="font-mono text-[11px] font-normal text-muted-foreground">
                          {r.user.participant?.participantId ?? "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">{eventName(r)}</div>
                        {r.team?.name && (
                          <div className="text-[11px] text-muted-foreground">
                            Team: {r.team.name}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={PAYMENT_STATE_STYLE[state]}>
                          {PAYMENT_STATE_LABEL[state]}
                        </Badge>
                        {r.payment?.status && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {r.payment.status.replace(/_/g, " ")}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {r.payment ? `₹${Number(r.payment.amount).toFixed(0)}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {format(r.createdAt, "MMM d, yyyy")}
                      </td>
                      <td className="px-3 py-2">
                        <ParticipantDetailSheet row={toParticipantDetail(r)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationNav
            baseUrl="/admin/participants"
            page={page}
            perPage={PER_PAGE}
            total={total}
            params={params}
            noun="participants"
          />
        </CardContent>
      </Card>
    </div>
  );
}