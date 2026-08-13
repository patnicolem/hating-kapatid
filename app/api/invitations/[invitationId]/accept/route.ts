import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { acceptGroupInvitation } from "@/lib/invitations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params;

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await prisma.groupInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!me || invitation.email !== me.email) {
      return NextResponse.json(
        { error: "This invitation is for a different email" },
        { status: 403 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation is no longer pending" },
        { status: 409 }
      );
    }

    await acceptGroupInvitation(invitationId, userId);

    return NextResponse.json({
      status: "accepted",
      groupId: invitation.groupId,
    });
  } catch (error) {
    console.error("Failed to accept invitation:", error);

    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}