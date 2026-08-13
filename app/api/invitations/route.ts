import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitations = await prisma.groupInvitation.findMany({
      where: {
        email: me.email,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      include: {
        group: { select: { id: true, name: true } },
        inviter: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(
      invitations.map((invitation) => ({
        id: invitation.id,
        group: invitation.group,
        inviter: {
          id: invitation.inviter.id,
          name: invitation.inviter.username,
        },
        email: invitation.email,
        createdAt: invitation.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to load invitations:", error);

    return NextResponse.json(
      { error: "Failed to load invitations" },
      { status: 500 }
    );
  }
}