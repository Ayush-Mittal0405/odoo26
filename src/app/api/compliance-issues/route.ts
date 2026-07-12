import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const issues = await prisma.complianceIssue.findMany({ orderBy: { dueDate: "asc" } });
    return NextResponse.json(issues.map((i) => ({
      id: i.issueId, issue: i.issue, severity: i.severity, department: i.department,
      owner: i.owner, dueDate: i.dueDate, status: i.status,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `COMP-${Date.now()}`;
    const ci = await prisma.complianceIssue.create({ data: {
      issueId: id, issue: body.issue, severity: body.severity, department: body.department,
      owner: body.owner, dueDate: body.dueDate, status: "open",
    }});
    return NextResponse.json({ id: ci.issueId, issue: ci.issue, severity: ci.severity, department: ci.department, owner: ci.owner, dueDate: ci.dueDate, status: ci.status }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
