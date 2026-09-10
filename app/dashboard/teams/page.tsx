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

  const [memberships, teamEvents] = await Promise.all([
    prisma.teamMember.findMany({
      where: { userId: session.id },
      include: {
        team: {
          include: {
            event: { select: { id: true, name: true, type: true, price: true } },
            leader: { select: { id: true, name: true, email: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            registration: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.event
      .findMany({
        where: { type: "TEAM", isActive: true, status: "OPEN" },
        select: { id: true, name: true, price: true, maxTeamSize: true },
        orderBy: { createdAt: "asc" },
      })
      .then((rows) =>
        rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), maxTeamSize: r.maxTeamSize }))
      ),
  ]);

  const teams = memberships.map((m) => ({ ...m.team, myRole: m.role }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Teams</h1>
          <p className="text-muted-foreground">
            Teams you lead or belong to, with member management.
          </p>
        </div>
        {teamEvents.length > 0 && <CreateTeamDialog events={teamEvents} />}
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re not in any team yet</CardTitle>
            <CardDescription>
              Create a team for a team event, or accept an invite sent to you.
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
                  {team.members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{m.user.name}</p>
                        <p className="text-xs text-muted-foreground">{m.user.email}</p>
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