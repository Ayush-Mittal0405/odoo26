import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const goals = await prisma.environmentalGoal.findMany({ orderBy: { goalId: "asc" } });
    return NextResponse.json(goals.map((g) => ({
      id: g.goalId, name: g.name, department: g.department,
      targetCo2: g.targetCo2, currentCo2: g.currentCo2, deadline: g.deadline, status: g.status,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `GOAL-${Date.now()}`;
    const g = await prisma.environmentalGoal.create({ data: {
      goalId: id, name: body.name, department: body.department,
      targetCo2: body.targetCo2, currentCo2: body.currentCo2 ?? 0,
      deadline: body.deadline, status: body.status ?? "on-track",
    }});
    return NextResponse.json({ id: g.goalId, name: g.name, department: g.department, targetCo2: g.targetCo2, currentCo2: g.currentCo2, deadline: g.deadline, status: g.status }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
