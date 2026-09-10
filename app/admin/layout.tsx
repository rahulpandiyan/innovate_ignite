import { getAuthSession } from "@/lib/authCookie";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/auth/signin");

  let userName: string | undefined;
  let userEmail: string | undefined;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true },
  });
  if (user) {
    userName = user.name;
    userEmail = user.email;
  }

  return <AdminShell userName={userName} userEmail={userEmail}>{children}</AdminShell>;
}