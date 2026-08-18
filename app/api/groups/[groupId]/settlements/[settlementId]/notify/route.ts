import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getMembership } from "@/lib/access";
import { SettlementStatus } from "@/lib/generated/prisma/client";
import { sendSettlementReminderEmail } from "@/lib/mail";

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
      include: {
        fromUser: { select: { id: true, username: true, email: true } },
        toUser: { select: { id: true, username: true, email: true } },
      },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      return NextResponse.json(
        { error: "Only pending settlements can be notified about" },
        { status: 400 }
      );
    }

    const isParty =
      settlement.fromUserId === userId || settlement.toUserId === userId;

    if (!isParty) {
      return NextResponse.json(
        { error: "Only the payer or the payee can notify about this settlement" },
        { status: 403 }
      );
    }

    const isFrom = settlement.fromUserId === userId;
    const counterparty = isFrom ? settlement.toUser : settlement.fromUser;
    const remitterName = isFrom
      ? settlement.fromUser.username
      : settlement.toUser.username;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true, currency: true },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    await sendSettlementReminderEmail({
      to: counterparty.email,
      toName: counterparty.username,
      remitterName,
      groupName: group.name,
      currency: group.currency,
      amount: Number(settlement.amount),
      fromName: settlement.fromUser.username,
      payeeName: settlement.toUser.username,
    });

    return NextResponse.json({
      ok: true,
      notifiedEmail: counterparty.email,
    });
  } catch (error) {
    console.error("Failed to send settlement reminder:", error);

    return NextResponse.json(
      { error: "Failed to send settlement reminder" },
      { status: 500 }
    );
  }
}