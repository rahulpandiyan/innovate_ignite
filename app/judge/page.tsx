import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authCookie";
import prisma from "@/lib/db";
import { getEventScope } from "@/lib/rbac";
import { getHomeRoute } from "@/lib/rbac-data";
import { getEventStandings } from "@/lib/judging";
import { ScoreForm } from "@/components/judge/score-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Scale, UsersRound } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function JudgePage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  if (!["JUDGE", "SUPER_ADMIN"].includes(session.role)) redirect(getHomeRoute(session.role));

  const scope = await getEventScope(session.id);

  const events =
    scope === null
      ? await prisma.event.findMany({ where: { isActive: true }, select: { id: true, name: true, type: true, status: true } })
      : await prisma.event.findMany({
          where: { id: { in: scope }, isActive: true },
          select: { id: true, name: true, type: true, status: true },
        });

  const standings = await Promise.all(
    events.map((e) => getEventStandings(e.id))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Score panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit final scores for confirmed entries. Scores are summed across all judges once
          published.
        </p>
      </div>

      {standings.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            You are not assigned to any active events.
          </CardContent>
        </Card>
      )}

      {standings.map((standing) => (
        <Card key={standing.eventId}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{standing.eventName}</CardTitle>
                <Badge variant="outline">{standing.eventType}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={standing.eventStatus === "ONGOING" ? "default" : "secondary"}>
                  {standing.eventStatus}
                </Badge>
                {standing.published.length > 0 && (
                  <Badge className="bg-green-600">Results published</Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Judges: {standing.judges.map((j) => j.name).join(", ") || "—"}{" "}
              · {standing.entries.length} eligible entries
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Entry</th>
                  <th className="px-4 py-2 font-medium">College</th>
                  <th className="px-4 py-2 font-medium">Members</th>
                  <th className="px-4 py-2 font-medium">My score</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Score entry</th>
                </tr>
              </thead>
              <tbody>
                {standing.entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No confirmed entries to score yet.
                    </td>
                  </tr>
                )}
                {standing.entries.map((entry) => {
                  const mine = entry.scores.find((s) => s.judgeId === session.id);
                  return (
                    <tr key={entry.entryId} className="border-b last:border-0 align-top">
                      <td className="px-4 py-3 font-medium">{entry.name}</td>
                      <td className="px-4 py-3">{entry.college}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.members ?? "—"}</td>
                      <td className="px-4 py-3 font-mono">{mine ? mine.score : "—"}</td>
                      <td className="px-4 py-3 font-mono font-semibold">{entry.scores.length > 0 ? entry.total : "—"}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <ScoreForm
                          eventId={standing.eventId}
                          category={entry.kind}
                          targetId={entry.entryId}
                          initialScore={mine?.score}
                          initialRemarks={mine?.remarks}
                        />
                        {mine && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Saved {format(mine.submittedAt, "MMM d, h:mm a")}
                            {mine.remarks ? " · " + mine.remarks : ""}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>

          {standing.published.length > 0 && (
            <CardContent className="mt-2 border-t pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Trophy className="h-4 w-4 text-amber-500" /> Live results
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {standing.published.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <UsersRound className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{p.name}</span>
                    </span>
                    <Badge variant={p.winnerStatus === "WINNER" ? "default" : "outline"}>
                      {p.winnerStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}