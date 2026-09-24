import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { ParticipantShell } from "@/components/participant/participant-shell";

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  EVENT_COORDINATOR: "/coordinator",
  STUDENT_COORDINATOR: "/coordinator",
  JUDGE: "/judge",
  ATTENDANCE_STAFF: "/attendance",
  FINANCE_ADMIN: "/admin/payments",
  CERTIFICATE_ADMIN: "/admin/certificates",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (ROLE_HOME[session.role]) {
    redirect(ROLE_HOME[session.role]);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      collegeName: true,
      participant: { select: { participantId: true } },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <ParticipantShell userName={user.name} userEmail={user.email}>
      {children}
    </ParticipantShell>
  );
}