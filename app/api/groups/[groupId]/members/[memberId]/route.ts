import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getMembership, isAdmin } from "@/lib/access";

async function requireGroupAdmin(groupId: string) {
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

  if (!isAdmin(membership.role)) {
    return NextResponse.json(
      { error: "Only admins can manage members" },
      { status: 403 }
    );
  }

  return null;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const { groupId, memberId } = await params;

    const denied = await requireGroupAdmin(groupId);

    if (denied) return denied;

    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: memberId, groupId } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const hasPaid = await prisma.expense.findFirst({
      where: { groupId, paidBy: memberId },
    });

    const hasSplit = await prisma.expenseSplit.findFirst({
      where: { expense: { groupId }, userId: memberId },
    });

    if (hasPaid || hasSplit) {
      return NextResponse.json(
        { error: "Member has expenses in this group and cannot be removed" },
        { status: 409 }
      );
    }

    await prisma.groupMember.delete({
      where: { id: membership.id },
    });

    const remainingMemberships = await prisma.groupMember.count({
      where: { userId: memberId },
    });

    const expensesAnywhere = await prisma.expense.count({
      where: { paidBy: memberId },
    });

    const splitsAnywhere = await prisma.expenseSplit.count({
      where: { userId: memberId },
    });

    if (
      remainingMemberships === 0 &&
      expensesAnywhere === 0 &&
      splitsAnywhere === 0
    ) {
      await prisma.user.delete({ where: { id: memberId } });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to remove member:", error);

    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}