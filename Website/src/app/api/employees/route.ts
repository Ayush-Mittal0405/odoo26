import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { xp: "desc" } });
    const mapped = employees.map((e) => ({
      id: e.employeeId, name: e.name, department: e.department,
      points: e.points, xp: e.xp, joinedChallenges: e.joinedChallenges, badges: e.badges,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emp = await prisma.employee.create({ data: {
      employeeId: body.id, name: body.name, department: body.department,
      points: body.points ?? 0, xp: body.xp ?? 0,
      joinedChallenges: body.joinedChallenges ?? [], badges: body.badges ?? [],
    }});
    return NextResponse.json({ id: emp.employeeId, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
