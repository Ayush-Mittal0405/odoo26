import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.complianceIssue.update({
      where: { issueId: id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.severity !== undefined && { severity: body.severity }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
        ...(body.owner !== undefined && { owner: body.owner }),
      },
    });
    return NextResponse.json({ id: updated.issueId, issue: updated.issue, severity: updated.severity, department: updated.department, owner: updated.owner, dueDate: updated.dueDate, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.complianceIssue.delete({ where: { issueId: id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
