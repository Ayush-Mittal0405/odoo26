import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.reward.findUnique({ where: { rewardId: id } });
    if (!existing) return NextResponse.json({ error: "Reward not found" }, { status: 404 });

    const newStock = body.stock !== undefined ? body.stock : existing.stock - 1;
    const updated = await prisma.reward.update({
      where: { rewardId: id },
      data: {
        stock: newStock,
        status: newStock <= 0 ? "out-of-stock" : "active",
        ...(body.name !== undefined && { name: body.name }),
      },
    });
    return NextResponse.json({ id: updated.rewardId, name: updated.name, description: updated.description, pointsRequired: updated.pointsRequired, stock: updated.stock, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
