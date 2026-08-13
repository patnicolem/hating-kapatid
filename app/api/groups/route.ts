import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupInclude, toGroup } from "@/lib/mappers";
import { getSessionUserId } from "@/lib/session";
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

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name?.trim();
    const currency = body.currency?.trim().toUpperCase();

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    if (!allowedCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name,
          currency,
        },
      });

      await tx.groupMember.create({
        data: {
          userId,
          groupId: group.id,
          role: GroupRole.OWNER,
        },
      });

      return group.id;
    });

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: groupInclude,
    });

    if (!group) {
      throw new Error("Group not found after creation");
    }

    return NextResponse.json(toGroup(group), { status: 201 });
  } catch (error) {
    console.error("Failed to create group:", error);

    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: groupInclude,
    });

    return NextResponse.json(groups.map(toGroup));
  } catch (error) {
    console.error("Failed to load groups:", error);

    return NextResponse.json(
      { error: "Failed to load groups" },
      { status: 500 }
    );
  }
}