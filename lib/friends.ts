import { prisma } from "@/lib/prisma";
import type {
  FriendUser,
  FriendsSummary,
} from "@/types/friend";

function toFriendUser(user: {
  id: string;
  username: string;
  email: string;
}): FriendUser {
  return {
    id: user.id,
    name: user.username,
    email: user.email,
  };
}

export async function getFriendsSummary(
  userId: string
): Promise<FriendsSummary> {
  const rows = await prisma.friend.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: { id: true, username: true, email: true },
      },
      addressee: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  const friends: FriendUser[] = [];
  const incoming: FriendsSummary["incoming"] = [];
  const outgoing: FriendsSummary["outgoing"] = [];

  const seenFriends = new Set<string>();

  for (const row of rows) {
    if (row.status === "ACCEPTED") {
      const other =
        row.requesterId === userId
          ? row.addressee
          : row.requester;

      if (!seenFriends.has(other.id)) {
        seenFriends.add(other.id);
        friends.push(toFriendUser(other));
      }
    } else if (row.status === "PENDING") {
      if (row.addresseeId === userId) {
        incoming.push({
          requestId: row.id,
          from: toFriendUser(row.requester),
          createdAt: row.createdAt.toISOString(),
        });
      } else if (row.requesterId === userId) {
        outgoing.push({
          requestId: row.id,
          to: toFriendUser(row.addressee),
          createdAt: row.createdAt.toISOString(),
        });
      }
    }
  }

  return { friends, incoming, outgoing };
}