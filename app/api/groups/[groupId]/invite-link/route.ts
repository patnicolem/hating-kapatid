import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getMembership, isAdmin } from "@/lib/access";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const membership = await getMembership(groupId, userId);

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    if (!isAdmin(membership.role)) {
      return NextResponse.json(
        { error: "Only admins can share the invite link" },
        { status: 403 }
      );
    }

    const existing = await prisma.groupInvitation.findFirst({
      where: {
        groupId,
        invitedBy: userId,
        token: { not: null },
      },
    });

    const invitation =
      existing ??
      (await prisma.groupInvitation.create({
        data: {
          groupId,
          invitedBy: userId,
          token: randomBytes(24).toString("base64url"),
          status: "PENDING",
        },
      }));

    const origin = new URL(request.url).origin;

    return NextResponse.json({
      url: `${origin}/invite/${invitation.token}`,
    });
  } catch (error) {
    console.error("Failed to create invite link:", error);

    return NextResponse.json(
      { error: "Failed to create invite link" },
      { status: 500 }
    );
  }
}