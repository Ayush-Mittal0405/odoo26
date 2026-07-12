import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse, EventData, CreateEventInput } from "@/types";

// ─── GET /api/events — List all events ───────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      ...(limit ? { take: parseInt(limit, 10) } : {}),
    });

    return NextResponse.json<ApiResponse<EventData[]>>({
      success: true,
      data: events as unknown as EventData[],
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// ─── POST /api/events — Create event (admin only) ───
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateEventInput = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.date || !body.venue) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required fields: title, description, date, venue" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        banner: body.banner ?? null,
        date: new Date(body.date),
        time: body.time ?? null,
        venue: body.venue,
        registrationLink: body.registrationLink ?? null,
        status: body.status ?? "upcoming",
        featured: body.featured ?? false,
      },
    });

    return NextResponse.json<ApiResponse<EventData>>(
      { success: true, data: event as unknown as EventData, message: "Event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
