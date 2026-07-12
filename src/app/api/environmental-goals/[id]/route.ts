import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.environmentalGoal.update({
      where: { goalId: id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.targetCo2 !== undefined && { targetCo2: body.targetCo2 }),
        ...(body.currentCo2 !== undefined && { currentCo2: body.currentCo2 }),
        ...(body.deadline !== undefined && { deadline: body.deadline }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json({ id: updated.goalId, name: updated.name, department: updated.department, targetCo2: updated.targetCo2, currentCo2: updated.currentCo2, deadline: updated.deadline, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.environmentalGoal.delete({ where: { goalId: id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
