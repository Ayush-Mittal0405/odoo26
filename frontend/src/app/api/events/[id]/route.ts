import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse, EventData, UpdateEventInput } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/events/[id] — Fetch single event ──────
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<EventData>>({
      success: true,
      data: event as unknown as EventData,
    });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/events/[id] — Update event (admin) ────
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const body: UpdateEventInput = await request.json();

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.banner !== undefined && { banner: body.banner ?? null }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.time !== undefined && { time: body.time ?? null }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.registrationLink !== undefined && { registrationLink: body.registrationLink ?? null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.featured !== undefined && { featured: body.featured }),
      },
    });

    return NextResponse.json<ApiResponse<EventData>>({
      success: true,
      data: event as unknown as EventData,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/events/[id] — Delete event (admin) ──
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
