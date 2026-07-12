import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } });
    return NextResponse.json(rewards.map((r) => ({
      id: r.rewardId, name: r.name, description: r.description,
      pointsRequired: r.pointsRequired, stock: r.stock, status: r.status,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `REW-${Date.now()}`;
    const r = await prisma.reward.create({ data: {
      rewardId: id, name: body.name, description: body.description,
      pointsRequired: body.pointsRequired, stock: body.stock ?? 0,
      status: body.stock > 0 ? "active" : "out-of-stock",
    }});
    return NextResponse.json({ id: r.rewardId, name: r.name, description: r.description, pointsRequired: r.pointsRequired, stock: r.stock, status: r.status }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
