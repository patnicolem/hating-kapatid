import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getFriendsSummary } from "@/lib/friends";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getFriendsSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to load friends:", error);

    return NextResponse.json(
      { error: "Failed to load friends" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (email === me.email) {
      return NextResponse.json(
        { error: "You can't add yourself as a friend" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { email },
    });

    if (!target) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: target.id },
          { requesterId: target.id, addresseeId: userId },
        ],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You're already friends, or a request is already pending" },
        { status: 409 }
      );
    }

    const friend = await prisma.friend.create({
      data: {
        requesterId: userId,
        addresseeId: target.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        requestId: friend.id,
        to: { id: target.id, name: target.username, email: target.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add friend:", error);

    return NextResponse.json(
      { error: "Failed to add friend" },
      { status: 500 }
    );
  }
}