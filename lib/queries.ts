import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { groupInclude, toGroup } from "@/lib/mappers";
import { getFriendsSummary } from "@/lib/friends";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.username,
    email: user.email,
    hasPassword: Boolean(user.passwordHash),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getGroups(userId: string) {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: groupInclude,
  });

  return groups.map(toGroup);
}

export async function getInvitations(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!me) return [];

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

  return invitations.map((invitation) => ({
    id: invitation.id,
    group: invitation.group,
    inviter: {
      id: invitation.inviter.id,
      name: invitation.inviter.username,
    },
    email: invitation.email ?? "",
    createdAt: invitation.createdAt.toISOString(),
  }));
}

export async function getFriendsData(userId: string) {
  return getFriendsSummary(userId);
}

export type InvitePreview = {
  group: { id: string; name: string };
  inviter: { id: string; name: string };
};

export async function getInvitePreview(
  token: string
): Promise<InvitePreview | null> {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { token },
    include: {
      group: { select: { id: true, name: true } },
      inviter: { select: { id: true, username: true } },
    },
  });

  if (!invitation) return null;

  return {
    group: { id: invitation.group.id, name: invitation.group.name },
    inviter: {
      id: invitation.inviter.id,
      name: invitation.inviter.username,
    },
  };
}

export async function isMemberOfGroup(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    select: { id: true },
  });

  return membership !== null;
}
