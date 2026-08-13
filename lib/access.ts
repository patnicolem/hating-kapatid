import { prisma } from "@/lib/prisma";
import { GroupRole } from "@/lib/generated/prisma/client";

export async function getMembership(
  groupId: string,
  userId: string
) {
  return prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });
}

export function isAdmin(
  role: GroupRole | undefined
): boolean {
  return role === GroupRole.OWNER || role === GroupRole.ADMIN;
}

export async function getUserRoleInGroup(
  groupId: string,
  userId: string
): Promise<GroupRole | null> {
  const membership = await getMembership(groupId, userId);

  return membership?.role ?? null;
}