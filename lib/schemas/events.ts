import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  type: z.enum(["SOLO", "TEAM"]),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  priceMode: z.enum(["PER_TEAM", "PER_PARTICIPANT", "SOLO_OR_GROUP"]).optional().default("PER_TEAM"),
  groupPrice: z.number().min(0).optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  imageUrl: z.string().url().optional(),
  rules: z.string().optional(),
  minTeamSize: z.number().int().min(1).optional(),
  maxTeamSize: z.number().int().min(1).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateEventSchema = z
  .object({
    name: z.string().min(1, "Event name is required").optional(),
    description: z.string().nullable().optional(),
    type: z.enum(["SOLO", "TEAM"]).optional(),
    category: z.string().min(1, "Category is required").optional(),
    price: z.number().min(0, "Price must be non-negative").optional(),
    priceMode: z.enum(["PER_TEAM", "PER_PARTICIPANT", "SOLO_OR_GROUP"]).optional(),
    groupPrice: z.number().min(0).nullable().optional(),
    date: z.string().datetime().nullable().optional(),
    time: z.string().nullable().optional(),
    venue: z.string().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    rules: z.string().nullable().optional(),
    minTeamSize: z.number().int().min(1).nullable().optional(),
    maxTeamSize: z.number().int().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
    status: z
      .enum(["DRAFT", "OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED", "CANCELLED"])
      .optional(),
  })
  .strict();
