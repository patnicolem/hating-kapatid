import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSettlement } from "@/lib/mappers";
import { getSessionUserId } from "@/lib/session";
import { getMembership } from "@/lib/access";
import { SettlementStatus } from "@/lib/generated/prisma/client";

export async function POST(
  _request: Request,
  {
    params,
  }: { params: Promise<{ groupId: string; settlementId: string }> }
) {
  try {
    const { groupId, settlementId } = await params;

    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getMembership(groupId, userId);

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, groupId },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    if (settlement.status === SettlementStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Settlement is already completed" },
        { status: 400 }
      );
    }

    if (settlement.status === SettlementStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Cancelled settlements cannot be completed" },
        { status: 400 }
      );
    }

    const isParty =
      settlement.fromUserId === userId || settlement.toUserId === userId;

    if (!isParty) {
      return NextResponse.json(
        { error: "Only the payer or the payee can complete this settlement" },
        { status: 403 }
      );
    }

    const updated = await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.COMPLETED,
        settledAt: new Date(),
      },
      include: {
        fromUser: { select: { id: true, username: true } },
        toUser: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(toSettlement(updated));
  } catch (error) {
    console.error("Failed to complete settlement:", error);

    return NextResponse.json(
      { error: "Failed to complete settlement" },
      { status: 500 }
    );
  }
}
