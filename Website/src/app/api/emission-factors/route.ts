import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({ orderBy: { factorId: "asc" } });
    return NextResponse.json(factors.map((f) => ({
      id: f.factorId, name: f.name, activityType: f.activityType,
      unit: f.unit, co2Factor: f.co2Factor, status: f.status,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `EF-${Date.now()}`;
    const ef = await prisma.emissionFactor.create({ data: {
      factorId: id, name: body.name, activityType: body.activityType,
      unit: body.unit, co2Factor: body.co2Factor, status: body.status ?? "draft",
    }});
    return NextResponse.json({ id: ef.factorId, name: ef.name, activityType: ef.activityType, unit: ef.unit, co2Factor: ef.co2Factor, status: ef.status }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
