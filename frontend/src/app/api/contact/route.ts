import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/types";

// ─── POST /api/contact — Public contact form submission ──
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
    console.error("POST /api/contact error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
