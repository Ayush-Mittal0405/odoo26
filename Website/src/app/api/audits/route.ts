import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const audits = await prisma.audit.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(audits.map((a) => ({
      id: a.auditId, name: a.name, date: a.date, auditor: a.auditor,
      findings: a.findings, status: a.status, scope: a.scope,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `AUD-${Date.now()}`;
    const a = await prisma.audit.create({ data: {
      auditId: id, name: body.name, date: body.date, auditor: body.auditor,
      findings: body.findings ?? 0, status: body.status ?? "scheduled", scope: body.scope,
    }});
    return NextResponse.json({ id: a.auditId, name: a.name, date: a.date, auditor: a.auditor, findings: a.findings, status: a.status, scope: a.scope }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
