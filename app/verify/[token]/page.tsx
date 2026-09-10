import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileBadge } from "lucide-react";
import { format } from "date-fns";
import { humanizeType } from "@/lib/certificates";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationToken: token },
    include: {
      participant: { include: { user: { select: { name: true } } } },
      college: { select: { name: true } },
      event: { select: { name: true } },
    },
  });

  if (!certificate || !certificate.isPublished) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <ShieldCheck className="h-8 w-8 text-green-600" />
      </div>
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <FileBadge className="h-3 w-3" /> Verified certificate
          </div>
          <CardTitle className="mt-3 text-2xl">
            {certificate.participant.user.name}
          </CardTitle>
          <CardDescription>INTERACT 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Type" value={humanizeType(certificate.type)} badge />
          <Row label="Event" value={certificate.event.name} />
          <Row label="College" value={certificate.college.name} />
          <Row label="Certificate ID" value={certificate.certificateId} mono />
          <Row
            label="Issued"
            value={format(certificate.issuedAt, "MMM d, yyyy 'at' h:mm a")}
          />
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        This page confirms the certificate above was officially issued by the INTERACT 2026
        committee.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      {badge ? (
        <Badge>{value}</Badge>
      ) : (
        <span className={mono ? "font-mono text-xs" : "font-medium"}>
          {value}
        </span>
      )}
    </div>
  );
}