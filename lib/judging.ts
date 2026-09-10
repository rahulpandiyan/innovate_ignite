import "server-only";
import prisma from "@/lib/db";

export type StandingsEntry = {
  entryId: string;
  kind: "team" | "solo";
  name: string;
  college: string;
  members?: string;
  scores: { judgeId: string; judgeName: string; score: number; remarks: string | null; submittedAt: Date }[];
  total: number;
};

export type EventStandings = {
  eventId: string;
  eventName: string;
  eventType: "SOLO" | "TEAM";
  eventStatus: string;
  judges: { id: string; name: string; email: string }[];
  entries: StandingsEntry[];
  published: {
    id: string;
    rank: number | null;
    winnerStatus: string;
    name: string;
    score: number | null;
  }[];
};

/**
 * Compute per-event judging standings. Entries are CONFIRMED registrations
 * (solos target the Participant row, teams target the Team row). Each judge
 * contributes their latest final score; an entry's total is the sum.
 */
export async function getEventStandings(eventId: string): Promise<EventStandings> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      teams: {
        include: {
          registration: { select: { status: true } },
          college: { select: { name: true } },
          leader: { select: { collegeName: true } },
          members: { include: { user: { select: { name: true } } } },
        },
      },
      registrations: {
        include: {
          user: { select: { id: true, name: true, collegeName: true } },
        },
      },
      judgeScores: {
        include: { judge: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "asc" },
      },
      judges: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      results: { orderBy: { rank: "asc" } },
    },
  });

  if (!event) throw new Error("Event not found");

  const entries: StandingsEntry[] = [];

  if (event.type === "TEAM") {
    for (const team of event.teams) {
      if (team.registration?.status !== "CONFIRMED") continue;
      entries.push({
        entryId: team.id,
        kind: "team",
        name: team.name,
        college: team.college?.name ?? team.leader.collegeName ?? "—",
        members: team.members.map((m) => m.user.name).join(", "),
        scores: [],
        total: 0,
      });
    }
  } else {
    const userIds = event.registrations.map((r) => r.user.id);
    const participants = await prisma.participant.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, userId: true },
    });
    const participantByUser = new Map(participants.map((p) => [p.userId, p.id]));
    for (const reg of event.registrations) {
      const participantId = participantByUser.get(reg.user.id);
      if (!participantId) continue;
      entries.push({
        entryId: participantId,
        kind: "solo",
        name: reg.user.name,
        college: reg.user.collegeName ?? "—",
        scores: [],
        total: 0,
      });
    }
  }

  for (const entry of entries) {
    const byJudge = new Map<string, StandingsEntry["scores"][number]>();
    for (const score of event.judgeScores) {
      if (!score.isFinal) continue;
      const matchesEntry =
        entry.kind === "team" ? score.teamId === entry.entryId : score.participantId === entry.entryId;
      if (!matchesEntry) continue;
      byJudge.set(score.judgeId, {
        judgeId: score.judgeId,
        judgeName: score.judge.name,
        score: Number(score.score),
        remarks: score.remarks,
        submittedAt: score.submittedAt,
      });
    }
    entry.scores = [...byJudge.values()];
    entry.total = entry.scores.reduce((s, x) => s + x.score, 0);
  }

  entries.sort((a, b) => b.total - a.total);

  // Resolve names for published results (Result stores scalar teamId/participantId).
  const teamIds = event.results.map((r) => r.teamId).filter(Boolean) as string[];
  const participantIds = event.results.map((r) => r.participantId).filter(Boolean) as string[];
  const [teams, soloParticipants] = await Promise.all([
    teamIds.length
      ? prisma.team.findMany({ where: { id: { in: teamIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    participantIds.length
      ? prisma.participant.findMany({
          where: { id: { in: participantIds } },
          select: { id: true, user: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));
  const soloName = new Map(soloParticipants.map((p) => [p.id, p.user.name]));

  return {
    eventId: event.id,
    eventName: event.name,
    eventType: event.type,
    eventStatus: event.status,
    judges: event.judges.map((j) => ({ id: j.user.id, name: j.user.name, email: j.user.email })),
    entries,
    published: event.results.map((r) => ({
      id: r.id,
      rank: r.rank,
      winnerStatus: r.winnerStatus,
      name: (r.teamId ? teamName.get(r.teamId) : r.participantId ? soloName.get(r.participantId) : null) ?? "—",
      score: r.score === null ? null : Number(r.score),
    })),
  };
}