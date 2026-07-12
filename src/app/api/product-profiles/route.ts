import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const profiles = await prisma.productProfile.findMany({ orderBy: { productId: "asc" } });
    return NextResponse.json(profiles.map((p) => ({
      id: p.productId, name: p.name, sku: p.sku,
      carbonFootprint: p.carbonFootprint, waterFootprint: p.waterFootprint,
      recycledContent: p.recycledContent, complianceScore: p.complianceScore,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `PROD-${Date.now()}`;
    const pp = await prisma.productProfile.create({ data: {
      productId: id, name: body.name, sku: body.sku,
      carbonFootprint: body.carbonFootprint, waterFootprint: body.waterFootprint,
      recycledContent: body.recycledContent, complianceScore: body.complianceScore,
    }});
    return NextResponse.json({ id: pp.productId, name: pp.name, sku: pp.sku, carbonFootprint: pp.carbonFootprint, waterFootprint: pp.waterFootprint, recycledContent: pp.recycledContent, complianceScore: pp.complianceScore }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
