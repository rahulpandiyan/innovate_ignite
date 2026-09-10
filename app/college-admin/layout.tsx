import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getHomeRoute } from "@/lib/rbac-data";
import { getCollegeIdForUser } from "@/lib/collegeAdmin";
import { CollegeAdminShell } from "@/components/college-admin/college-admin-shell";

const ALLOWED = new Set(["COLLEGE_ADMIN", "SUPER_ADMIN"]);

export default async function CollegeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!ALLOWED.has(session.role)) redirect(getHomeRoute(session.role));

  const collegeId = await getCollegeIdForUser(session.id);
  if (!collegeId) redirect("/dashboard");

  const [user, college] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    }),
    prisma.college.findUnique({ where: { id: collegeId } }),
  ]);
  if (!user || !college) redirect("/dashboard");

  return (
    <CollegeAdminShell
      userName={user.name}
      userEmail={user.email}
      collegeName={college.name}
      collegeCode={college.code}
    >
      {children}
    </CollegeAdminShell>
  );
}