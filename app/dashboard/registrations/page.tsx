import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrPassButton } from "@/components/participant/qr-pass-button";
import { PayRegistrationButton } from "@/components/participant/pay-registration";
import { WhatsAppGroupButton } from "@/components/participant/whatsapp-group-button";
import { festSchedule } from "@/data/schedule";
import { format } from "date-fns";

function scheduleFallback(name: string) {
  for (const day of festSchedule) {
    for (const slot of day.slots) {
      const hit = slot.items.find((i) => i.name === name)
      if (hit) return { date: new Date(day.date === "8 October 2026" ? "2026-10-08T09:30:00+05:30" : "2026-10-09T09:30:00+05:30"), venue: hit.venue as string, time: slot.time as string }
    }
    if (day.runsAlongside?.name === name) return { date: new Date("2026-10-09T09:30:00+05:30"), venue: day.runsAlongside.venue as string, time: day.runsAlongside.time as string }
  }
  return null
}

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-green-600/15 text-green-700",
  PENDING: "bg-amber-500/15 text-amber-700",
  REJECTED: "bg-red-600/15 text-red-700",
  CANCELLED: "bg-gray-500/15 text-gray-600",
};

export default async function RegistrationsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const registrations = await prisma.registration.findMany({
    where: { userId: session.id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          date: true,
          time: true,
          venue: true,
          price: true,
        },
      },
      team: { select: { id: true, name: true } },
      payment: { select: { status: true, amount: true, transactionId: true } },
      attendees: {
        select: {
          attendeeId: true,
          qrPass: { select: { token: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = await Promise.all(
    registrations.map(async (reg) => {
      const attendee = reg.attendees[0];
      let qrDataUrl: string | null = null;
      if (attendee?.qrPass) {
        qrDataUrl = await QRCode.toDataURL(attendee.qrPass.token, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 420,
        });
      }
      return { ...reg, qrDataUrl, qrToken: attendee?.qrPass?.token ?? null, attendeeId: attendee?.attendeeId ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Registrations</h1>
        <p className="text-muted-foreground">
          Every event you&apos;re registered for, with payment and QR pass status.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No registrations yet</CardTitle>
            <CardDescription>
              Head over to the events page to register for an event.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All registrations</CardTitle>
            <CardDescription>{rows.length} total</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date / Venue</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Pass</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((reg) => {
                  const fb = !reg.event.date || !reg.event.venue ? scheduleFallback(reg.event.name) : null
                  const d = reg.event.date ?? fb?.date ?? null
                  const venue = reg.event.venue ?? fb?.venue ?? "Venue TBA"
                  const time = reg.event.time ?? fb?.time ?? null
                  return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.event.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {d ? format(d, "MMM d, yyyy") : "TBA"}
                        {time ? ` · ${time}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {venue}
                        {reg.team?.name ? ` · ${reg.team.name}` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{reg.registrationId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLE[reg.status]}>
                        {reg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {reg.payment ? (
                        <div className="flex items-center gap-2">
                          <span className={reg.payment.status === "SUCCESS" ? "text-green-700" : "text-amber-600"}>
                            {reg.payment.status}
                          </span>
                          <span className="text-muted-foreground">₹{reg.payment.amount.toString()}</span>
                          {reg.payment.status !== "SUCCESS" && reg.status === "PENDING" && (
                            <PayRegistrationButton registrationId={reg.id} amount={Number(reg.payment.amount)} />
                          )}
                          {reg.payment.status === "SUCCESS" && (
                            <WhatsAppGroupButton eventName={reg.event.name} />
                          )}
                        </div>
                      ) : reg.status === "PENDING" && Number(reg.event.price) > 0 ? (
                        <PayRegistrationButton registrationId={reg.id} amount={Number(reg.event.price)} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {reg.qrDataUrl && reg.qrToken && reg.attendeeId ? (
                        <QrPassButton
                          data={{
                            qrDataUrl: reg.qrDataUrl,
                            eventName: reg.event.name,
                            registrationId: reg.registrationId,
                            attendeeId: reg.attendeeId,
                            token: reg.qrToken,
                          }}
                        />
                      ) : reg.status === "CONFIRMED" ? (
                        <span className="text-xs text-amber-600">Generating pass… refresh</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pass after confirmation</span>
                      )}
                    </TableCell>
                  </TableRow>
                  )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}