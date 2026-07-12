import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.employeeParticipation.update({
      where: { partId: id },
      data: { ...(body.status !== undefined && { status: body.status }) },
    });
    return NextResponse.json({ id: updated.partId, employeeName: updated.employeeName, activityName: updated.activityName, date: updated.date, hasProof: updated.hasProof, proofFileName: updated.proofFileName ?? undefined, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
