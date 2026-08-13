import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toExpense } from "@/lib/mappers";
import { validateExpense } from "@/lib/expenses/validation";
import { getSessionUserId } from "@/lib/session";
import { getMembership } from "@/lib/access";

async function requireGroupMember(groupId: string) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const membership = await getMembership(groupId, userId);

  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this group" },
      { status: 403 }
    );
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await params;

    const denied = await requireGroupMember(groupId);

    if (denied) return denied;

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, groupId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
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

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        paidBy: body.paidBy,
        description: body.description.trim(),
        amount: Number(body.amount),
        splitType: result.splitType,
        splits: {
          deleteMany: {},
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

    return NextResponse.json(toExpense(updated));
  } catch (error) {
    console.error("Failed to update expense:", error);

    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const { groupId, expenseId } = await params;

    const denied = await requireGroupMember(groupId);

    if (denied) return denied;

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, groupId },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to remove expense:", error);

    return NextResponse.json(
      { error: "Failed to remove expense" },
      { status: 500 }
    );
  }
}