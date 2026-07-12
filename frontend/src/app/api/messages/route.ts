import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

// ─── GET /api/messages — List all messages (admin only) ───
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// ─── POST /api/messages — Submit a message (public) ──────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required fields: name, email, subject, message" },
        { status: 400 }
      );
    }

    await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
