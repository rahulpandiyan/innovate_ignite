import "server-only";
import prisma from "@/lib/db";

export const ID_PREFIX = {
  PARTICIPANT: process.env.ID_PREFIX_PARTICIPANT ?? "VTU26-",
  TEAM: "TEAM-",
  REGISTRATION: "REG-",
  ATTENDEE: "ATT-",
  CERTIFICATE: "CERT-",
} as const;

export async function nextPublicId(
  entity: string,
  prefix: string,
  pad = 6
): Promise<string> {
  const counter = await prisma.idCounter.upsert({
    where: { entity },
    update: { value: { increment: 1 } },
    create: { entity, value: 1 },
  });
  return `${prefix}${String(counter.value).padStart(pad, "0")}`;
}