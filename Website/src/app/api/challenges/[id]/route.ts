import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.challenge.update({
      where: { challengeId: id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.progress !== undefined && { progress: body.progress }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    return NextResponse.json({ id: updated.challengeId, name: updated.name, description: updated.description, category: updated.category, status: updated.status, xpReward: updated.xpReward, pointsReward: updated.pointsReward, target: updated.target, progress: updated.progress, duration: updated.duration });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
