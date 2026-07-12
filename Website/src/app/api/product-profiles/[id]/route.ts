import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.productProfile.update({
      where: { productId: id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.carbonFootprint !== undefined && { carbonFootprint: body.carbonFootprint }),
        ...(body.waterFootprint !== undefined && { waterFootprint: body.waterFootprint }),
        ...(body.recycledContent !== undefined && { recycledContent: body.recycledContent }),
        ...(body.complianceScore !== undefined && { complianceScore: body.complianceScore }),
      },
    });
    return NextResponse.json({ id: updated.productId, name: updated.name, sku: updated.sku, carbonFootprint: updated.carbonFootprint, waterFootprint: updated.waterFootprint, recycledContent: updated.recycledContent, complianceScore: updated.complianceScore });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.productProfile.delete({ where: { productId: id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
