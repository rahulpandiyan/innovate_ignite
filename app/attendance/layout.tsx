import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { AttendanceShell } from "@/components/attendance/attendance-shell";

const ALLOWED = new Set(["ATTENDANCE_STAFF", "EVENT_COORDINATOR", "SUPER_ADMIN"]);

export default async function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (!ALLOWED.has(session.role)) {
    redirect(getHomeRoute(session.role));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <AttendanceShell userName={user.name} userEmail={user.email}>
      {children}
    </AttendanceShell>
  );
}