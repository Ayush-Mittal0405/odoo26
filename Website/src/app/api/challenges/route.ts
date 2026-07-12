import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({ orderBy: { challengeId: "asc" } });
    return NextResponse.json(challenges.map((c) => ({
      id: c.challengeId, name: c.name, description: c.description, category: c.category,
      status: c.status, xpReward: c.xpReward, pointsReward: c.pointsReward,
      target: c.target, progress: c.progress, duration: c.duration,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `CHAL-${Date.now()}`;
    const c = await prisma.challenge.create({ data: {
      challengeId: id, name: body.name, description: body.description, category: body.category,
      status: body.status ?? "Draft", xpReward: body.xpReward ?? 0, pointsReward: body.pointsReward ?? 0,
      target: body.target, progress: 0, duration: body.duration,
    }});
    return NextResponse.json({ id: c.challengeId, name: c.name, description: c.description, category: c.category, status: c.status, xpReward: c.xpReward, pointsReward: c.pointsReward, target: c.target, progress: c.progress, duration: c.duration }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
