import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getMembership, isAdmin } from "@/lib/access";
import { sendInviteEmail } from "@/lib/mail";

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
        { error: "Only admins can invite members" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        user: { email },
      },
      include: { user: true },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Member is already in this group" },
        { status: 409 }
      );
    }

    const existingInvite = await prisma.groupInvitation.findFirst({
      where: {
        groupId,
        email,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 409 }
      );
    }

    await prisma.groupInvitation.create({
      data: {
        groupId,
        email,
        invitedBy: userId,
      },
    });

    // Email is a courtesy notification — never block the invite on it.
    try {
      const inviter = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });

      await sendInviteEmail({
        to: email,
        groupName: group.name,
        inviterName: inviter?.username ?? "Someone",
      });
    } catch (error) {
      console.error("Failed to send invite email:", error);
    }

    return NextResponse.json(
      { status: "invited", email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to invite member:", error);

    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}