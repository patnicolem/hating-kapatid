import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.username,
      email: user.email,
      hasPassword: Boolean(user.passwordHash),
    });
  } catch (error) {
    console.error("Failed to load user:", error);

    return NextResponse.json(
      { error: "Failed to load user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const data: {
      username?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (body.name !== undefined) {
      const name = body.name?.trim();

      if (!name) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }

      data.username = name;
    }

    if (body.email !== undefined) {
      const email = body.email?.trim().toLowerCase();

      if (!email || !EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 409 }
        );
      }

      data.email = email;
    }

    if (body.password !== undefined && body.password !== "") {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (!currentUser.passwordHash) {
        return NextResponse.json(
          {
            error:
              "No password is set for this account. Sign in with Google instead.",
          },
          { status: 400 }
        );
      }

      const currentPassword = body.currentPassword;

      const validCurrent = await verifyPassword(
        currentPassword,
        currentUser.passwordHash
      );

      if (!validCurrent) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const password = body.password;

      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }

      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return NextResponse.json(
          {
            error:
              "Password must contain at least one letter and one number",
          },
          { status: 400 }
        );
      }

      data.passwordHash = await hashPassword(password);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Failed to update user:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}