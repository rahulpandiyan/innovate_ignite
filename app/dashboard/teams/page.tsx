import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, UsersRound } from "lucide-react";
import { CreateTeamDialog } from "@/components/participant/create-team-dialog";
import { InviteMember } from "@/components/participant/invite-member";

export default async function TeamsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.id },
    include: {
      team: {
        include: {
          event: { select: { id: true, name: true, type: true, price: true } },
          leader: { select: { id: true, name: true, email: true, phone: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          registration: { select: { id: true, status: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // Only allow team creation for TEAM events where the user is registered AND confirmed (paid).
  // For paid team events, payment must be verified (registration.status = CONFIRMED).
  const registeredTeamEventIds = await prisma.registration
    .findMany({
      where: { userId: session.id, status: "CONFIRMED", event: { type: "TEAM", isActive: true, status: "OPEN" } },
      select: { eventId: true },
    })
    .then((rows) => rows.map((r) => r.eventId));

  // Also find pending registrations so we can nudge to pay first
  const pendingTeamEventIds = await prisma.registration
    .findMany({
      where: { userId: session.id, status: "PENDING", event: { type: "TEAM", isActive: true, status: "OPEN" } },
      select: { eventId: true },
    })
    .then((rows) => rows.map((r) => r.eventId));

  const alreadyInTeamEventIds = new Set(memberships.map((m) => m.team.event.id));

  const availableEventIds = registeredTeamEventIds.filter((id) => !alreadyInTeamEventIds.has(id));
  const pendingWithoutTeam = pendingTeamEventIds.filter((id) => !alreadyInTeamEventIds.has(id) && !availableEventIds.includes(id));

  const teamEvents =
    availableEventIds.length > 0
      ? await prisma.event
          .findMany({
            where: { id: { in: availableEventIds } },
            select: { id: true, name: true, price: true, maxTeamSize: true },
            orderBy: { createdAt: "asc" },
          })
          .then((rows) => rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), maxTeamSize: r.maxTeamSize })))
      : [];

  const pendingEvents =
    pendingWithoutTeam.length > 0
      ? await prisma.event.findMany({
          where: { id: { in: pendingWithoutTeam } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  const teams = memberships.map((m) => ({ ...m.team, myRole: m.role }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Teams</h1>
          <p className="text-muted-foreground">
            Teams you lead or belong to. Create a team only after your registration is confirmed (paid).
          </p>
        </div>
        {teamEvents.length > 0 && <CreateTeamDialog events={teamEvents} />}
      </div>

      {pendingEvents.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">Complete payment to create teams</CardTitle>
            <CardDescription className="text-amber-800">
              You’re registered for {pendingEvents.map((e) => e.name).join(", ")} but payment is still pending. Go to My Registrations to pay and wait for confirmation — then you can create a team. Teams cannot be created before payment.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {teams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re not in any team yet</CardTitle>
            <CardDescription>
              {teamEvents.length > 0
                ? "Create a team for one of your confirmed team events above."
                : pendingEvents.length > 0
                  ? "You have pending registrations — complete payment first, then create a team."
                  : "Register for a team event and complete payment to create a team."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        teams.map((team) => {
          const isLeader = team.leaderId === session.id;
          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    {isLeader && (
                      <Badge variant="outline" className="gap-1">
                        <Crown className="h-3 w-3" /> Leader
                      </Badge>
                    )}
                    <Badge variant="secondary">{team.event.name}</Badge>
                    {team.registration && (
                      <Badge variant="outline">{team.registration.status}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {team.members.length} member{team.members.length === 1 ? "" : "s"}
                  </span>
                </div>
                <CardDescription>
                  Led by {team.leader.name} · ₹{team.event.price.toString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="divide-y rounded-lg border">
                  {team.members.map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{m.user.name}</p>
                        <p className="text-xs text-muted-foreground">{m.user.phone ?? m.user.email}</p>
                      </div>
                      <Badge variant={m.role === "LEADER" ? "default" : "outline"}>
                        {m.role === "LEADER" ? "Leader" : "Member"}
                      </Badge>
                    </li>
                  ))}
                </ul>
                {isLeader && <InviteMember teamId={team.id} />}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}