import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  requireAuth,
  parseBody,
  successResponse,
  errorResponse,
} from "@/lib/apiHelpers";
import { inviteUserSchema } from "@/lib/schemas/teams";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { avatarUrlFor } from "@/lib/avatar";

type RouteContext = { params: Promise<{ teamId: string }> };

// POST /api/teams/:teamId/invite — Leader directly adds a member by email (no invite/accept flow)
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { teamId } = await context.params;

    const parsed = await parseBody(req, inviteUserSchema);
    if (parsed.error) return parsed.error;

    const { email, name: providedName } = parsed.data as { email: string; name?: string };
    const memberName = (providedName ?? "").trim() || email.split("@")[0];

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        event: {
          select: { id: true, maxTeamSize: true },
        },
        members: { select: { id: true } },
      },
    });

    if (!team) {
      return errorResponse("Team not found.", 404);
    }

    // Only leader can invite
    if (team.leaderId !== auth.session.id) {
      return errorResponse("Only the team leader can send invites.", 403);
    }

    // Check team size limit
    if (team.event.maxTeamSize && team.members.length >= team.event.maxTeamSize) {
      return errorResponse("Team has reached maximum size.", 400);
    }

    // Find or create the member user — owner directly adds by name+email, no invite/accept
    let invitee = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!invitee) {
      const leader = await prisma.user.findUnique({ where: { id: auth.session.id }, select: { collegeId: true, collegeName: true } });
      const hash = await bcrypt.hash(randomUUID(), 8);
      // generate a unique placeholder phone
      const placeholderPhone = `+91${Date.now().toString().slice(-10)}`;
      invitee = await prisma.user.create({
        data: {
          name: memberName,
          email,
          phone: placeholderPhone,
          collegeName: leader?.collegeName ?? "VVIT",
          collegeId: leader?.collegeId ?? null,
          password: hash,
          emailVerified: true,
          role: "PARTICIPANT",
          photoUrl: avatarUrlFor(email),
        },
        select: { id: true, name: true, email: true },
      });
    }

    // Can't add yourself
    if (invitee.id === auth.session.id) {
      return errorResponse("You cannot add yourself.", 400);
    }

    // Check if already in a team for this event (one-team-per-event)
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: invitee.id,
        team: { eventId: team.event.id },
      },
    });

    if (existingMembership) {
      return errorResponse("This user is already in a team for this event.", 409);
    }

    // Already a member of this team?
    const alreadyInThisTeam = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: invitee.id } },
    });
    if (alreadyInThisTeam) {
      return errorResponse("User is already in this team.", 409);
    }

    // Directly add to team — no invite
    const member = await prisma.teamMember.create({
      data: { teamId, userId: invitee.id, role: "MEMBER" },
    });

    // clean up any stale invite if it exists
    await prisma.teamInvite.deleteMany({ where: { teamId, invitedUserId: invitee.id } });

    return successResponse(
      {
        member: { id: member.id, teamId, user: invitee },
        message: `${invitee.name} added to team.`,
      },
      201
    );
  } catch (error) {
    console.error("[POST /api/teams/:teamId/invite]", error);
    return errorResponse("Internal server error.", 500);
  }
}
