import prisma from "@/lib/db";

export async function getCollegeIdForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { collegeId: true },
  });
  return user?.collegeId ?? null;
}