import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.emissionFactor.update({
      where: { factorId: id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.activityType !== undefined && { activityType: body.activityType }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.co2Factor !== undefined && { co2Factor: body.co2Factor }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json({ id: updated.factorId, name: updated.name, activityType: updated.activityType, unit: updated.unit, co2Factor: updated.co2Factor, status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.emissionFactor.delete({ where: { factorId: id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
