import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  eventId: z.string().uuid("Invalid event ID"),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Name required"),
        phone: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
      })
    )
    .max(11)
    .optional(),
});

export const inviteUserSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(1).optional(),
});

export const respondInviteSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
});
