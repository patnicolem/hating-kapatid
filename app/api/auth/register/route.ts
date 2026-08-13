import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

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

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await hashPassword(password);

    let user: { id: string; email: string; username: string };

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: name,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          username: name,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });
    }

    await createSession(user.id);

    return NextResponse.json(
      { id: user.id, name: user.username, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to register:", error);

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}