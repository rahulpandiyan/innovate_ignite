import "server-only";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

export type CertificateTypeName = "PARTICIPATION" | "WINNER" | "RUNNER_UP" | "SPECIAL_RECOGNITION";

/**
 * Ensure a certificate exists for a (participant, event, type) tuple - creates
 * when missing, otherwise returns the existing one (idempotent issue).
 */
export async function issueCertificate(args: {
  participantId: string;
  eventId: string;
  collegeId: string;
  type: CertificateTypeName;
  templateId?: string | null;
  issuedBy: string;
  isPublished?: boolean;
}) {
  const existing = await prisma.certificate.findFirst({
    where: {
      participantId: args.participantId,
      eventId: args.eventId,
      type: args.type,
    },
  });
  if (existing) return { certificate: existing, created: false };

  const certificate = await prisma.$transaction(async (tx) => {
    const cert = await tx.certificate.create({
      data: {
        certificateId: nextCertificateId(),
        participantId: args.participantId,
        collegeId: args.collegeId,
        eventId: args.eventId,
        type: args.type,
        templateId: args.templateId ?? null,
        isPublished: args.isPublished ?? true,
        verificationToken: "VFY-" + randomUUID(),
      },
    });
    await tx.auditLog.create({
      data: {
        userId: args.issuedBy,
        action: "CERTIFICATE_GENERATED",
        entityType: "Certificate",
        entityId: cert.id,
        details: { eventId: args.eventId, participantId: args.participantId, type: args.type },
      },
    });
    return cert;
  });

  return { certificate, created: true };
}

let certCounter = 1000;
function nextCertificateId(): string {
  certCounter += 1;
  return `CERT-${String(certCounter).padStart(4, "0")}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Generate a landscape A4 certificate PDF for a participant.
 */
export async function generateCertificatePdf(args: {
  name: string;
  eventName: string;
  collegeName: string;
  certificateId: string;
  verificationToken: string;
  type: CertificateTypeName;
  issuedAt: Date;
}): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth(); // 841.89
  const height = doc.internal.pageSize.getHeight(); // 595.28

  // Outer border (double line)
  doc.setDrawColor(176, 141, 87);
  doc.setLineWidth(3);
  doc.rect(28, 28, width - 56, height - 56);
  doc.setLineWidth(0.75);
  doc.rect(38, 38, width - 76, height - 76);

  const cx = width / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.setTextColor(120, 92, 48);
  doc.text("CERTIFICATE", cx, 100, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.setTextColor(80, 70, 60);
  doc.text("This is to certify that", cx, 150, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(42);
  doc.setTextColor(40, 38, 34);
  doc.text(args.name, cx, 205, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.setTextColor(80, 70, 60);
  doc.text(
    `has successfully participated in "${args.eventName}" at INTERACT 2026`,
    cx,
    250,
    { align: "center", maxWidth: width - 200 }
  );

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(90, 85, 80);
  doc.text(
    `Awarded as ${humanizeType(args.type)}  ·  ${args.collegeName}`,
    cx,
    285,
    { align: "center" }
  );

  doc.setDrawColor(176, 141, 87);
  doc.setLineWidth(1);
  doc.line(cx - 130, 330, cx + 130, 330);
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text("Event Committee · INTERACT 2026", cx, 345, { align: "center" });

  // Bottom footer
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 100);
  doc.text(
    `Certificate ID: ${args.certificateId}   ·   Issued: ${args.issuedAt.toLocaleDateString("en-IN")}`,
    cx,
    height - 60,
    { align: "center" }
  );
  doc.text(`Verification: /verify/${args.verificationToken}`, cx, height - 45, {
    align: "center",
  });

  const buf = Buffer.from(doc.output("arraybuffer"));
  return buf;
}

export function humanizeType(type: CertificateTypeName): string {
  switch (type) {
    case "WINNER":
      return "Winner";
    case "RUNNER_UP":
      return "Runner-up";
    case "SPECIAL_RECOGNITION":
      return "Special Recognition";
    default:
      return "Participation";
  }
}