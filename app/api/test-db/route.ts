import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const currency = body.currency?.trim().toUpperCase();

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        currency,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Failed to create group:", error);

    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}