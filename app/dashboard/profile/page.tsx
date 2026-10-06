import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/participant/profile-form";
import LatentQuestionsForm from "@/components/participant/latent-questions-form";

const LATENT_EVENT_NAME = "VVIT GOT LATENT";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      phone: true,
      collegeName: true,
      collegeIdNumber: true,
      aadharNumber: true,
      photoUrl: true,
      participant: { select: { participantId: true } },
    },
  });

  if (!user) redirect("/auth/signin");

  const latentReg = await prisma.registration.findFirst({
    where: {
      userId: session.id,
      event: { name: LATENT_EVENT_NAME },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    select: {
      id: true,
      registrationId: true,
      status: true,
      eventId: true,
      event: { select: { name: true } },
      formResponses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let latentAnswers: Record<string, string> = {};
  if (latentReg?.formResponses && typeof latentReg.formResponses === "object") {
    const fr = latentReg.formResponses as any;
    if (fr.latentAnswers && typeof fr.latentAnswers === "object") {
      Object.entries(fr.latentAnswers).forEach(([k, v]) => {
        if (typeof k === "string" && typeof v === "string") latentAnswers[k] = v;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
          <CardDescription>Your unique records on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">Email verified ✓</Badge>
          {user.participant && <Badge variant="outline">{user.participant.participantId}</Badge>}
        </CardContent>
      </Card>

      <ProfileForm
        initial={{
          name: user.name,
          phone: (user.phone ?? "").replace(/^\+919/, "9").replace(/^\+91/, ""),
          collegeName: user.collegeName,
          collegeIdNumber: user.collegeIdNumber ?? "",
          aadhaarNumber: user.aadharNumber ?? "",
          photoUrl: user.photoUrl ?? "",
          email: user.email,
        }}
      />

      {latentReg && (
        <LatentQuestionsForm
          registrationId={latentReg.id}
          eventName={latentReg.event.name}
          initialAnswers={latentAnswers}
        />
      )}
    </div>
  );
}