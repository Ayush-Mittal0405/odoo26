import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const emp = await prisma.employee.findUnique({ where: { employeeId: id } });
    if (!emp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: emp.employeeId, name: emp.name, department: emp.department,
      points: emp.points, xp: emp.xp, joinedChallenges: emp.joinedChallenges, badges: emp.badges,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.employee.update({
      where: { employeeId: id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.points !== undefined && { points: body.points }),
        ...(body.xp !== undefined && { xp: body.xp }),
        ...(body.joinedChallenges !== undefined && { joinedChallenges: body.joinedChallenges }),
        ...(body.badges !== undefined && { badges: body.badges }),
      },
    });
    return NextResponse.json({
      id: updated.employeeId, name: updated.name, department: updated.department,
      points: updated.points, xp: updated.xp,
      joinedChallenges: updated.joinedChallenges, badges: updated.badges,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
