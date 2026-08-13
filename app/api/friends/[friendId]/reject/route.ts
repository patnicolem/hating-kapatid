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

    await prisma.friend.update({
      where: { id: friendId },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({ status: "declined" });
  } catch (error) {
    console.error("Failed to decline friend request:", error);

    return NextResponse.json(
      { error: "Failed to decline friend request" },
      { status: 500 }
    );
  }
}