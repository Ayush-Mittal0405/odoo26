import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.csrActivity.findMany({ orderBy: { activityId: "asc" } });
    return NextResponse.json(activities.map((a) => ({
      id: a.activityId, name: a.name, category: a.category, icon: a.icon,
      joinedCount: a.joinedCount, evidenceRequired: a.evidenceRequired, joinedEmployees: a.joinedEmployees,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `CSR-${Date.now()}`;
    const a = await prisma.csrActivity.create({ data: {
      activityId: id, name: body.name, category: body.category, icon: body.icon ?? "Star",
      joinedCount: 0, evidenceRequired: body.evidenceRequired ?? false, joinedEmployees: [],
    }});
    return NextResponse.json({ id: a.activityId, name: a.name, category: a.category, icon: a.icon, joinedCount: a.joinedCount, evidenceRequired: a.evidenceRequired, joinedEmployees: a.joinedEmployees }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
