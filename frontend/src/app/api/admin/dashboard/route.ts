import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

// ─── GET /api/admin/dashboard — Dashboard data (admin only) ──
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalAlbums,
      totalMessages,
      unreadMessages,
      recentEvents,
      recentMessages,
      statistics,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: "upcoming" } }),
      prisma.event.count({ where: { status: "completed" } }),
      prisma.galleryAlbum.count(),
      prisma.message.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.event.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.message.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.statistics.findFirst(),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalAlbums,
        totalMessages,
        unreadMessages,
        recentEvents,
        recentMessages,
        statistics,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
