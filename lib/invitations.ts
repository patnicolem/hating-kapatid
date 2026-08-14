import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function ensureFriendship(
  tx: Prisma.TransactionClient,
  inviterId: string,
  userId: string
) {
  if (inviterId === userId) return;

  const existing = await tx.friend.findFirst({
    where: {
      OR: [
        { requesterId: inviterId, addresseeId: userId },
        { requesterId: userId, addresseeId: inviterId },
      ],
    },
  });

  if (existing) {
    if (existing.status !== "ACCEPTED") {
      await tx.friend.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });
    }
  } else {
    await tx.friend.create({
      data: {
        requesterId: inviterId,
        addresseeId: userId,
        status: "ACCEPTED",
      },
    });
  }
}

export async function acceptGroupInvitation(
  invitationId: string,
  userId: string
) {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
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

    if (invitation.status !== "ACCEPTED") {
      await tx.groupInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      });
    }

    await ensureFriendship(tx, invitation.invitedBy, userId);
  });
}

export async function rejectGroupInvitation(
  invitationId: string
) {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status === "ACCEPTED") {
    throw new Error("Invitation has already been accepted");
  }

  await prisma.groupInvitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });
}