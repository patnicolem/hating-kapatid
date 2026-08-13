import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupInclude, toGroup } from "@/lib/mappers";
import { getSessionUserId } from "@/lib/session";
import { getMembership, isAdmin } from "@/lib/access";
import { GroupRole } from "@/lib/generated/prisma/client";

const allowedCurrencies = [
  "PHP",
  "THB",
  "USD",
  "AUD",
  "SGD",
  "TWD",
  "JPY",
  "EUR",
];

export async function PATCH(
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

    if (!isAdmin(membership.role)) {
      return NextResponse.json(
        { error: "Only admins can update group settings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const currency = body.currency?.trim().toUpperCase();

    const data: { name?: string; currency?: string } = {};

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          { error: "Group name is required" },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (currency !== undefined) {
      if (!allowedCurrencies.includes(currency)) {
        return NextResponse.json(
          { error: "Invalid currency" },
          { status: 400 }
        );
      }

      data.currency = currency;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data,
      include: groupInclude,
    });

    return NextResponse.json(toGroup(updated));
  } catch (error) {
    console.error("Failed to update group:", error);

    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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

    if (membership.role !== GroupRole.OWNER) {
      return NextResponse.json(
        { error: "Only the group owner can delete the group" },
        { status: 403 }
      );
    }

    const memberRows = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const memberUserIds = memberRows.map((row) => row.userId);

    await prisma.group.delete({
      where: { id: groupId },
    });

    for (const memberUserId of memberUserIds) {
      const remainingMemberships = await prisma.groupMember.count({
        where: { userId: memberUserId },
      });

      const expensesAnywhere = await prisma.expense.count({
        where: { paidBy: memberUserId },
      });

      const splitsAnywhere = await prisma.expenseSplit.count({
        where: { userId: memberUserId },
      });

      if (
        remainingMemberships === 0 &&
        expensesAnywhere === 0 &&
        splitsAnywhere === 0
      ) {
        await prisma.user.delete({ where: { id: memberUserId } });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete group:", error);

    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}