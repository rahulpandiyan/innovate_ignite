import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InviteActions } from "@/components/participant/invite-actions";
import { format } from "date-fns";
import { GAMING_EVENT_NAME, getGameChoice } from "@/lib/eventDisplay";

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

  const gamingRegs = await prisma.registration.findMany({
    where: { event: { name: GAMING_EVENT_NAME } },
    select: { userId: true, formResponses: true },
  });
  const gameByUser = new Map<string, string>();
  for (const r of gamingRegs) {
    const g = getGameChoice(GAMING_EVENT_NAME, r.formResponses);
    if (g) gameByUser.set(r.userId, g);
  }
  const inviteEventName = (inv: (typeof invites)[number]) =>
    inv.Team.event.name === GAMING_EVENT_NAME
      ? (gameByUser.get(inv.Team.leader.id) ?? inv.Team.event.name)
      : inv.Team.event.name;

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
                        {inviteEventName(inv)}
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