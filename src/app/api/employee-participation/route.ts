import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const parts = await prisma.employeeParticipation.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(parts.map((p) => ({
      id: p.partId, employeeName: p.employeeName, activityName: p.activityName,
      date: p.date, hasProof: p.hasProof, proofFileName: p.proofFileName ?? undefined, status: p.status,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `PART-${Date.now()}`;
    const p = await prisma.employeeParticipation.create({ data: {
      partId: id, employeeName: body.employeeName, activityName: body.activityName,
      date: body.date, hasProof: body.hasProof ?? false,
      proofFileName: body.proofFileName ?? null, status: "pending",
    }});
    return NextResponse.json({ id: p.partId, employeeName: p.employeeName, activityName: p.activityName, date: p.date, hasProof: p.hasProof, proofFileName: p.proofFileName ?? undefined, status: p.status }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
