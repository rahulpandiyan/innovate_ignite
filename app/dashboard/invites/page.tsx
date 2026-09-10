import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteActions } from "@/components/participant/invite-actions";
import { format } from "date-fns";

export default async function InvitesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");

  const invites = await prisma.teamInvite.findMany({
    where: { invitedUserId: session.id, status: "PENDING" },
    include: {
      Team: {
        include: {
          event: { select: { id: true, name: true, type: true } },
          leader: { select: { id: true, name: true } },
          members: { select: { id: true } },
        },
      },
      User_TeamInvite_invitedByIdToUser: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Invites</h1>
        <p className="text-muted-foreground">
          Accept or decline invitations to join a team.
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No pending invites</CardTitle>
            <CardDescription>
              When someone invites you to a team, it will show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        invites.map((inv) => (
          <Card key={inv.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {inv.Team.name}
                    <Badge variant="secondary" className="ml-2">
                      {inv.Team.event.name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Led by {inv.Team.leader.name} · {inv.Team.members.length} member
                    {inv.Team.members.length === 1 ? "" : "s"} · invited by{" "}
                    {inv.User_TeamInvite_invitedByIdToUser.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format(inv.createdAt, "MMM d, yyyy")}
                  </span>
                  <InviteActions inviteId={inv.id} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
}