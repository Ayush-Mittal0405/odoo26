import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ─── PUT /api/messages/[id] — Update read status (admin) ──
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
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid message ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.message.findUnique({ where: { id: messageId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        read: body.read,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("PUT /api/messages/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/messages/[id] — Delete message (admin) ──
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
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid message ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.message.findUnique({ where: { id: messageId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("DELETE /api/messages/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
