import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    // body.joinedEmployees is the new full list (or we increment count)
    const existing = await prisma.csrActivity.findUnique({ where: { activityId: id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const updated = await prisma.csrActivity.update({
      where: { activityId: id },
      data: {
        ...(body.joinedEmployees !== undefined && {
          joinedEmployees: body.joinedEmployees,
          joinedCount: body.joinedEmployees.length,
        }),
        ...(body.joinedCount !== undefined && { joinedCount: body.joinedCount }),
      },
    });
    return NextResponse.json({ id: updated.activityId, name: updated.name, category: updated.category, icon: updated.icon, joinedCount: updated.joinedCount, evidenceRequired: updated.evidenceRequired, joinedEmployees: updated.joinedEmployees });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
