import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const notifs = await prisma.appNotification.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(notifs.map((n) => ({
      id: n.notifId, title: n.title, description: n.description,
      category: n.category, timestamp: n.timestamp, read: n.read,
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `NT-${Date.now()}`;
    const n = await prisma.appNotification.create({ data: {
      notifId: id, title: body.title, description: body.description,
      category: body.category, timestamp: "Just Now", read: false,
    }});
    return NextResponse.json({ id: n.notifId, title: n.title, description: n.description, category: n.category, timestamp: n.timestamp, read: n.read }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
