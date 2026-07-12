import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse, StatisticsData, UpdateStatisticsInput } from "@/types";

// ─── GET /api/statistics — Fetch statistics ──────────
export async function GET() {
  try {
    let stats = await prisma.statistics.findFirst();

    // Auto-create default statistics row if none exists
    if (!stats) {
      stats = await prisma.statistics.create({
        data: {
          treesPlanted: 0,
          cleanlinessDrives: 0,
          volunteers: 0,
          studentsEducated: 0,
          eventsConducted: 0,
        },
      });
    }

    return NextResponse.json<ApiResponse<StatisticsData>>({
      success: true,
      data: stats as unknown as StatisticsData,
    });
  } catch (error) {
    console.error("GET /api/statistics error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/statistics — Update statistics (admin) ─
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateStatisticsInput = await request.json();

    let existing = await prisma.statistics.findFirst();

    if (!existing) {
      existing = await prisma.statistics.create({
        data: {
          treesPlanted: body.treesPlanted ?? 0,
          cleanlinessDrives: body.cleanlinessDrives ?? 0,
          volunteers: body.volunteers ?? 0,
          studentsEducated: body.studentsEducated ?? 0,
          eventsConducted: body.eventsConducted ?? 0,
        },
      });

      return NextResponse.json<ApiResponse<StatisticsData>>({
        success: true,
        data: existing as unknown as StatisticsData,
        message: "Statistics created successfully",
      });
    }

    const stats = await prisma.statistics.update({
      where: { id: existing.id },
      data: {
        ...(body.treesPlanted !== undefined && { treesPlanted: body.treesPlanted }),
        ...(body.cleanlinessDrives !== undefined && { cleanlinessDrives: body.cleanlinessDrives }),
        ...(body.volunteers !== undefined && { volunteers: body.volunteers }),
        ...(body.studentsEducated !== undefined && { studentsEducated: body.studentsEducated }),
        ...(body.eventsConducted !== undefined && { eventsConducted: body.eventsConducted }),
      },
    });

    return NextResponse.json<ApiResponse<StatisticsData>>({
      success: true,
      data: stats as unknown as StatisticsData,
      message: "Statistics updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/statistics error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update statistics" },
      { status: 500 }
    );
  }
}
