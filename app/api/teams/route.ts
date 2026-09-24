import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  requireAuth,
  parseBody,
  successResponse,
  errorResponse,
} from "@/lib/apiHelpers";
import { createTeamSchema } from "@/lib/schemas/teams";
import bcrypt from "bcryptjs";
import { avatarUrlFor } from "@/lib/avatar";
import { randomUUID } from "crypto";

// GET /api/teams — List teams the authenticated user belongs to
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const memberships = await prisma.teamMember.findMany({
      where: { userId: auth.session.id },
      include: {
        team: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                type: true,
                category: true,
              },
            },
            leader: {
              select: { id: true, name: true, email: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    const teams = memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
    }));

    return successResponse({ teams });
  } catch (error) {
    console.error("[GET /api/teams]", error);
    return errorResponse("Internal server error.", 500);
  }
}

// POST /api/teams — Create a team for an event
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const parsed = await parseBody(req, createTeamSchema);
    if (parsed.error) return parsed.error;

    const { name, eventId, members } = parsed.data;

    // Verify event exists, is active, and is a TEAM event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, isActive: true, type: true, name: true, maxTeamSize: true, minTeamSize: true },
    });

    if (!event || !event.isActive) {
      return errorResponse("Event not found or not available.", 404);
    }

    if (event.type !== "TEAM") {
      return errorResponse("Teams can only be created for team events.", 400);
    }

    // Must have a confirmed (paid) registration for this event before creating a team
    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId: auth.session.id, eventId } },
      select: { status: true, event: { select: { price: true } } },
    });
    if (!registration) {
      return errorResponse("You must register for this event before creating a team.", 400);
    }
    const isPaidEvent = Number(registration.event.price) > 0;
    if (isPaidEvent && registration.status !== "CONFIRMED") {
      return errorResponse("Complete payment and wait for confirmation before creating a team. Check My Registrations to pay.", 400);
    }

    // Enforce one team per event per user (check if user is already in a team for this event)
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId: auth.session.id,
        team: { eventId },
      },
    });

    if (existingMembership) {
      return errorResponse(
        "You are already in a team for this event.",
        409
      );
    }

    // Validate members count against event limits (including leader)
    const incomingCount = members?.length ?? 0;
    const totalSize = 1 + incomingCount;
    if (event.maxTeamSize && totalSize > event.maxTeamSize) {
      return errorResponse(`Team size cannot exceed ${event.maxTeamSize}. You are adding ${incomingCount} teammate(s) + you = ${totalSize}.`, 400);
    }
    if (incomingCount > 0) {
      const phones = members!.map((m) => m.phone);
      if (new Set(phones).size !== phones.length) {
        return errorResponse("Duplicate mobile numbers in teammates.", 400);
      }
      if (phones.includes((await prisma.user.findUnique({ where: { id: auth.session.id }, select: { phone: true } }))?.phone ?? "")) {
        return errorResponse("You cannot add your own mobile as a teammate.", 400);
      }
    }

    // Create team + add creator as leader + direct teammates (no invite, no account needed for them beyond placeholder)
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          eventId,
          leaderId: auth.session.id,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: auth.session.id,
          role: "LEADER",
        },
      });

      if (members && members.length > 0) {
        const leader = await tx.user.findUnique({ where: { id: auth.session.id }, select: { collegeId: true, collegeName: true } });
        for (const m of members) {
          let teammate = await tx.user.findUnique({ where: { phone: m.phone }, select: { id: true } });
          if (!teammate) {
            const hash = await bcrypt.hash(randomUUID(), 8);
            const email = `${m.phone}@team.local`;
            teammate = await tx.user.create({
              data: {
                name: m.name,
                email,
                phone: m.phone,
                collegeName: leader?.collegeName ?? "VVIT",
                collegeId: leader?.collegeId ?? null,
                password: hash,
                emailVerified: true,
                role: "PARTICIPANT",
                photoUrl: avatarUrlFor(email),
              },
              select: { id: true },
            });
          } else {
            // ensure not already in a team for this event
            const exists = await tx.teamMember.findFirst({ where: { userId: teammate.id, team: { eventId } } });
            if (exists) throw new Error(`${m.name} is already in a team for this event.`);
          }
          await tx.teamMember.create({
            data: { teamId: newTeam.id, userId: teammate.id, role: "MEMBER" },
          });
        }
      }

      return tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          event: {
            select: { id: true, name: true, type: true },
          },
          leader: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
        },
      });
    });

    return successResponse({ team }, 201);
  } catch (error) {
    console.error("[POST /api/teams]", error);
    return errorResponse("Internal server error.", 500);
  }
}
