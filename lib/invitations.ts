import { prisma } from "@/lib/prisma";

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

  const alreadyMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId: invitation.groupId,
      },
    },
  });

  if (!alreadyMember) {
    await prisma.groupMember.create({
      data: {
        userId,
        groupId: invitation.groupId,
      },
    });
  }

  if (invitation.status !== "ACCEPTED") {
    await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });
  }
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