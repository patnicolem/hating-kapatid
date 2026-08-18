import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSettlement, groupInclude } from "@/lib/mappers";
import { computeSuggestedSettlements } from "@/lib/expenses/settlement";
import { getSessionUserId } from "@/lib/session";
import { getMembership } from "@/lib/access";
import { SettlementStatus } from "@/lib/generated/prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

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

    const [settlements, group] = await Promise.all([
      prisma.settlement.findMany({
        where: { groupId },
        include: {
          fromUser: { select: { id: true, username: true } },
          toUser: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.group.findUnique({
        where: { id: groupId },
        include: groupInclude,
      }),
    ]);

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const suggested = computeSuggestedSettlements(
      group.expenses.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amount: Number(expense.amount),
        paidBy: expense.paidBy,
        splitType: expense.splitType,
        splits: expense.splits.map((split) => ({
          memberId: split.userId,
          value: Number(split.value),
        })),
      })),
      group.members.map((member) => ({
        id: member.user.id,
        name: member.user.username,
        email: member.user.email,
        role: member.role,
      })),
      settlements.map((settlement) => ({
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        amount: Number(settlement.amount),
        status: settlement.status,
      }))
    );

    return NextResponse.json({
      suggested,
      settlements: settlements.map(toSettlement),
    });
  } catch (error) {
    console.error("Failed to load settlements:", error);

    return NextResponse.json(
      { error: "Failed to load settlements" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

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

    const body = await request.json();

    const fromUserId = body.fromUserId;
    const toUserId = body.toUserId;
    const amount = Math.round(Number(body.amount) * 100) / 100;

    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { error: "Both members are required" },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: "A member cannot settle with themselves" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    const memberRows = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const memberIds = new Set(memberRows.map((row) => row.userId));

    if (!memberIds.has(fromUserId) || !memberIds.has(toUserId)) {
      return NextResponse.json(
        { error: "Both members must be in this group" },
        { status: 400 }
      );
    }

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId,
        toUserId,
        amount,
        status: SettlementStatus.PENDING,
      },
      include: {
        fromUser: { select: { id: true, username: true } },
        toUser: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(toSettlement(settlement), { status: 201 });
  } catch (error) {
    console.error("Failed to create settlement:", error);

    return NextResponse.json(
      { error: "Failed to create settlement" },
      { status: 500 }
    );
  }
}
