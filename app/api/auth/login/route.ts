import { NextRequest, NextResponse } from "next/server";
import { newLoginSchema } from "@/lib/schemas/newAuth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/authCookie";
import { getHomeRoute } from "@/lib/rbac-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = newLoginSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid input", issues: input.error.issues },
        },
        { status: 400 }
      );
    }

    const { email, password } = input.data;

    // Use consistent timing to prevent user enumeration
    const passwordToCompare = "$2b$12$invalidhashpadding000000000000000000000000000000000000";
    let passwordMatch = await bcrypt.compare(password, passwordToCompare);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        collegeId: true,
        roleId: true,
        role: true,
        password: true,
        userRole: { select: { name: true } },
      },
    });

    if (!user?.password) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password." } },
        { status: 401 }
      );
    }

    passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password." } },
        { status: 401 }
      );
    }

    const role = user.userRole?.name ?? user.role;
    const home = getHomeRoute(role);

    await setAuthCookie({
      id: user.id,
      email: user.email,
      role,
      collegeId: user.collegeId,
      roleId: user.roleId,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: null,
          role,
          home,
        },
      },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error." } },
      { status: 500 }
    );
  }
}