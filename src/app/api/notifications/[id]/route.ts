import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.appNotification.update({
      where: { notifId: id },
      data: { ...(body.read !== undefined && { read: body.read }) },
    });
    return NextResponse.json({ id: updated.notifId, title: updated.title, description: updated.description, category: updated.category, timestamp: updated.timestamp, read: updated.read });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
