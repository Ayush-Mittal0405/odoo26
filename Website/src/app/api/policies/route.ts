import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({ orderBy: { policyId: "asc" } });
    return NextResponse.json(policies.map((p) => ({
      id: p.policyId, name: p.name, category: p.category,
      status: p.status, version: p.version, lastUpdated: p.lastUpdated,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `POL-${Date.now()}`;
    const p = await prisma.policy.create({ data: {
      policyId: id, name: body.name, category: body.category,
      status: body.status ?? "draft", version: body.version ?? "v1.0",
      lastUpdated: new Date().toISOString().split("T")[0],
    }});
    return NextResponse.json({ id: p.policyId, name: p.name, category: p.category, status: p.status, version: p.version, lastUpdated: p.lastUpdated }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
