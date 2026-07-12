import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const acks = await prisma.policyAcknowledgement.findMany({ orderBy: { ackId: "asc" } });
    return NextResponse.json(acks.map((a) => ({
      id: a.ackId, employeeName: a.employeeName, policyName: a.policyName,
      status: a.status, date: a.date ?? undefined,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `ACK-${Date.now()}`;
    const a = await prisma.policyAcknowledgement.create({ data: {
      ackId: id, employeeName: body.employeeName, policyName: body.policyName,
      status: "acknowledged", date: new Date().toISOString().split("T")[0],
    }});
    return NextResponse.json({ id: a.ackId, employeeName: a.employeeName, policyName: a.policyName, status: a.status, date: a.date ?? undefined }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
