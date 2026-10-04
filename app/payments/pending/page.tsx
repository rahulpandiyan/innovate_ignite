import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { UserContactDialog } from "@/components/finance/user-contact-dialog";
import { RemindPaymentButton } from "@/components/finance/remind-payment-button";
import { ExportExcelButton } from "@/components/ui/export-excel";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailWarning, Search } from "lucide-react";
import { format } from "date-fns";
import { displayEventName, getGameChoice } from "@/lib/eventDisplay";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function PendingPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["FINANCE_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const sp = searchParams ? await searchParams : {};
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  // Registrations with no submitted payment yet: no payment row, or a
  // PENDING row with no transaction id (user hasn't uploaded anything).
  const pendingWhere: Prisma.RegistrationWhereInput = {
    status: "PENDING",
    event: { price: { gt: 0 } },
    OR: [
      { payment: null },
      { payment: { status: "PENDING", transactionId: null } },
    ],
    ...(q
      ? {
          AND: [
            {
              OR: [
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
                { user: { phone: { contains: q, mode: "insensitive" } } },
                { user: { collegeName: { contains: q, mode: "insensitive" } } },
                { user: { participant: { participantId: { contains: q, mode: "insensitive" } } } },
                { registrationId: { contains: q, mode: "insensitive" } },
              ],
            },
          ],
        }
      : {}),
  };

  const include = {
    user: { select: { name: true, email: true, phone: true, collegeName: true, participant: { select: { participantId: true } } } },
    event: { select: { name: true, price: true } },
    payment: { select: { status: true, amount: true, transactionId: true } },
  } as const;

  const [pendingTotal, pendingRegs, allPending] = await Promise.all([
    prisma.registration.count({ where: pendingWhere }),
    prisma.registration.findMany({
      where: pendingWhere,
      include,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.registration.findMany({
      where: pendingWhere,
      include,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingExport = allPending.map((r) => ({
    RegisteredAt: format(r.createdAt, "yyyy-MM-dd HH:mm"),
    Participant: r.user.name,
    Email: r.user.email,
    Phone: r.user.phone,
    College: r.user.collegeName,
    ParticipantID: r.user.participant?.participantId ?? "",
    Event: displayEventName(r.event.name, r.formResponses),
    Game: getGameChoice(r.event.name, r.formResponses) ?? "",
    Amount: r.payment ? Number(r.payment.amount) : Number(r.event.price),
    RegistrationID: r.registrationId,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered but no UPI transaction or screenshot uploaded yet. Nudge them by mail to pay and book the slot.
        </p>
      </div>

      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MailWarning className="h-4 w-4 text-amber-600" />
                Not submitted yet ({pendingTotal})
              </CardTitle>
              <CardDescription>
                These participants have not uploaded any payment proof. Send a reminder mail with their payment link.
              </CardDescription>
            </div>
            <ExportExcelButton data={pendingExport} filename={`pending-payments-${format(new Date(), "yyyy-MM-dd")}`} sheetName="Pending" label={`Export ${pendingExport.length}`} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form method="GET" className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search participant, email, phone or participant ID…"
                className="h-9 pl-9"
                aria-label="Search pending participants"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-9">
                Search
              </Button>
              {q && (
                <Button asChild size="sm" variant="outline" className="h-9">
                  <a href="/payments/pending">Reset</a>
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 font-medium">Registered</th>
                <th className="px-4 py-2 font-medium">Participant</th>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Remind</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nobody pending — every registration has a submitted payment.
                  </td>
                </tr>
              )}
              {pendingRegs.map((r) => (
                <tr key={r.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-2 text-muted-foreground">
                    {format(r.createdAt, "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{r.user.name}</span>
                      <UserContactDialog
                        user={{ name: r.user.name, email: r.user.email, phone: r.user.phone, collegeName: r.user.collegeName }}
                        participantId={r.user.participant?.participantId ?? null}
                        registrationId={r.registrationId}
                        eventName={displayEventName(r.event.name, r.formResponses)}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{r.user.email}</div>
                    <a href={`tel:${r.user.phone}`} className="text-xs font-mono text-[#2362EC] hover:underline">
                      {r.user.phone}
                    </a>
                  </td>
                  <td className="px-4 py-2">{displayEventName(r.event.name, r.formResponses)}</td>
                  <td className="px-4 py-2 font-mono">₹{Number(r.payment?.amount ?? r.event.price).toFixed(0)}</td>
                  <td className="px-4 py-2">
                    <RemindPaymentButton registrationId={r.id} participantName={r.user.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-4 pb-4">
            <PaginationNav
              baseUrl="/payments/pending"
              page={page}
              perPage={PER_PAGE}
              total={pendingTotal}
              params={{ q }}
              noun="pending registrations"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
