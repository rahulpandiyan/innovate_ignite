import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth, parseBody, successResponse, errorResponse } from "@/lib/apiHelpers";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional(),
  isStaff: z.boolean().default(false),
});

const updateSchema = contactSchema.partial().extend({ id: z.string().min(1) });

type Params = { params: Promise<{ eventId: string }> };

// Coordinators listed in the admin panel (portal accounts) may edit the
// public contact list for their own event; super admins may edit any.
async function canManage(userId: string, role: string, eventId: string) {
  if (role === "SUPER_ADMIN") return true;
  const assigned = await prisma.eventCoordinator.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { id: true },
  });
  return !!assigned;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { eventId } = await params;
    const contacts = await prisma.eventCoordinatorContact.findMany({
      where: { eventId },
      orderBy: [{ isStaff: "desc" }, { sortOrder: "asc" }],
    });
    return successResponse({ contacts });
  } catch (error) {
    console.error("[GET coordinator-contacts]", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { eventId } = await params;
    if (!(await canManage(auth.session.id, auth.session.role, eventId))) {
      return errorResponse("Forbidden.", 403);
    }

    const parsed = await parseBody(req, contactSchema);
    if (parsed.error) return parsed.error;
    const data = parsed.data;

    const count = await prisma.eventCoordinatorContact.count({ where: { eventId } });
    const contact = await prisma.eventCoordinatorContact.create({
      data: {
        eventId,
        name: data.name,
        phone: data.phone ?? null,
        isStaff: data.isStaff ?? false,
        sortOrder: count,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.session.id,
        action: "COORDINATOR_ASSIGNED",
        entityType: "Event",
        entityId: eventId,
        details: { change: "contact_added", name: data.name, isStaff: data.isStaff ?? false },
      },
    });

    return successResponse({ contact }, 201);
  } catch (error) {
    console.error("[POST coordinator-contacts]", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { eventId } = await params;
    if (!(await canManage(auth.session.id, auth.session.role, eventId))) {
      return errorResponse("Forbidden.", 403);
    }

    const parsed = await parseBody(req, updateSchema);
    if (parsed.error) return parsed.error;
    const { id, ...fields } = parsed.data;

    const existing = await prisma.eventCoordinatorContact.findFirst({
      where: { id, eventId },
      select: { id: true },
    });
    if (!existing) return errorResponse("Contact not found.", 404);

    const contact = await prisma.eventCoordinatorContact.update({
      where: { id: existing.id },
      data: {
        ...(fields.name !== undefined ? { name: fields.name } : {}),
        ...(fields.phone !== undefined ? { phone: fields.phone ?? null } : {}),
        ...(fields.isStaff !== undefined ? { isStaff: fields.isStaff } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.session.id,
        action: "COORDINATOR_ASSIGNED",
        entityType: "Event",
        entityId: eventId,
        details: { change: "contact_updated", id, ...fields },
      },
    });

    return successResponse({ contact });
  } catch (error) {
    console.error("[PATCH coordinator-contacts]", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { eventId } = await params;
    if (!(await canManage(auth.session.id, auth.session.role, eventId))) {
      return errorResponse("Forbidden.", 403);
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return errorResponse("Contact id is required.", 400);

    const existing = await prisma.eventCoordinatorContact.findFirst({
      where: { id, eventId },
      select: { id: true, name: true },
    });
    if (!existing) return errorResponse("Contact not found.", 404);

    await prisma.eventCoordinatorContact.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        userId: auth.session.id,
        action: "COORDINATOR_ASSIGNED",
        entityType: "Event",
        entityId: eventId,
        details: { change: "contact_removed", id, name: existing.name },
      },
    });

    return successResponse({ message: "Contact removed." });
  } catch (error) {
    console.error("[DELETE coordinator-contacts]", error);
    return errorResponse("Internal server error.", 500);
  }
}
