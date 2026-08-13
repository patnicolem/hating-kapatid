import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const { friendId } = await params;

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friend = await prisma.friend.findUnique({
      where: { id: friendId },
    });

    if (!friend || friend.addresseeId !== userId) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (friend.status !== "PENDING") {
      return NextResponse.json(
        { error: "Friend request is no longer pending" },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.friend.update({
        where: { id: friendId },
        data: { status: "ACCEPTED" },
      }),
      prisma.friend.upsert({
        where: {
          requesterId_addresseeId: {
            requesterId: userId,
            addresseeId: friend.requesterId,
          },
        },
        create: {
          requesterId: userId,
          addresseeId: friend.requesterId,
          status: "ACCEPTED",
        },
        update: {},
      }),
    ]);

    return NextResponse.json({ status: "accepted" });
  } catch (error) {
    console.error("Failed to accept friend request:", error);

    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
}