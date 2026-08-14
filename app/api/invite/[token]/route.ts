import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { ensureFriendship } from "@/lib/invitations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await prisma.groupInvitation.findUnique({
      where: { token },
      include: {
        group: { select: { id: true, name: true } },
        inviter: { select: { id: true, username: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invite link is invalid or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      group: { id: invitation.group.id, name: invitation.group.name },
      inviter: {
        id: invitation.inviter.id,
        name: invitation.inviter.username,
      },
    });
  } catch (error) {
    console.error("Failed to load invite:", error);

    return NextResponse.json(
      { error: "Failed to load invite" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await prisma.groupInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invite link is invalid or expired" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const alreadyMember = await tx.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: invitation.groupId,
          },
        },
      });

      if (!alreadyMember) {
        await tx.groupMember.create({
          data: {
            userId,
            groupId: invitation.groupId,
          },
        });
      }

      await ensureFriendship(tx, invitation.invitedBy, userId);
    });

    return NextResponse.json({ groupId: invitation.groupId });
  } catch (error) {
    console.error("Failed to join group via invite link:", error);

    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}