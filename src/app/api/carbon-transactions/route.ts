import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const txs = await prisma.carbonTransaction.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(txs.map((t) => ({
      id: t.txId, date: t.date, department: t.department, activityType: t.activityType,
      description: t.description, quantity: t.quantity, unit: t.unit, co2e: t.co2e, source: t.source,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `TX-${Date.now()}`;
    const tx = await prisma.carbonTransaction.create({ data: {
      txId: id, date: body.date, department: body.department, activityType: body.activityType,
      description: body.description, quantity: body.quantity, unit: body.unit,
      co2e: body.co2e, source: body.source ?? "Manual",
    }});
    return NextResponse.json({ id: tx.txId, date: tx.date, department: tx.department, activityType: tx.activityType, description: tx.description, quantity: tx.quantity, unit: tx.unit, co2e: tx.co2e, source: tx.source }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
