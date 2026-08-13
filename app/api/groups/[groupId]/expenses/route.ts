import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toExpense } from "@/lib/mappers";
import { validateExpense } from "@/lib/expenses/validation";
import { getSessionUserId } from "@/lib/session";
import { getMembership } from "@/lib/access";

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

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const membership = await getMembership(groupId, userId);

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const memberRows = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const memberIds = new Set(memberRows.map((row) => row.userId));

    const body = await request.json();

    const result = validateExpense(body, memberIds);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        groupId,
        paidBy: body.paidBy,
        description: body.description.trim(),
        amount: Number(body.amount),
        splitType: result.splitType,
        splits: {
          create: result.splitValues.map((split) => ({
            userId: split.userId,
            value: split.value,
          })),
        },
      },
      include: {
        splits: true,
      },
    });

    return NextResponse.json(toExpense(expense), { status: 201 });
  } catch (error) {
    console.error("Failed to add expense:", error);

    return NextResponse.json(
      { error: "Failed to add expense" },
      { status: 500 }
    );
  }
}