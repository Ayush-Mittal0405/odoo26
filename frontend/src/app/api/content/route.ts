import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse, WebsiteContentData, UpdateWebsiteContentInput } from "@/types";

// ─── GET /api/content — Fetch website content ───────
export async function GET() {
  try {
    // Always return the first (and only) row
    let content = await prisma.websiteContent.findFirst();

    // Auto-create default content if none exists
    if (!content) {
      content = await prisma.websiteContent.create({
        data: {
          about:
            "Pavitrarpan Foundation is a non-profit organization dedicated to creating a positive impact on society through environmental conservation, education, and community development initiatives.",
          mission:
            "To foster sustainable development through tree plantation, cleanliness drives, education, and community empowerment, creating a cleaner, greener, and more educated society.",
          vision:
            "A world where every community thrives in a clean environment with access to quality education and opportunities for growth.",
          goals:
            "Plant 10,000 trees by 2030. Conduct regular cleanliness drives across communities. Educate underprivileged students. Build a network of 1,000+ active volunteers.",
        },
      });
    }

    return NextResponse.json<ApiResponse<WebsiteContentData>>({
      success: true,
      data: content as unknown as WebsiteContentData,
    });
  } catch (error) {
    console.error("GET /api/content error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/content — Update website content (admin) ─
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateWebsiteContentInput = await request.json();

    // Get existing content (or the first row)
    let existing = await prisma.websiteContent.findFirst();

    if (!existing) {
      // Create with defaults merged with provided values
      existing = await prisma.websiteContent.create({
        data: {
          about: body.about ?? "",
          mission: body.mission ?? "",
          vision: body.vision ?? "",
          goals: body.goals ?? "",
        },
      });

      return NextResponse.json<ApiResponse<WebsiteContentData>>({
        success: true,
        data: existing as unknown as WebsiteContentData,
        message: "Content created successfully",
      });
    }

    const content = await prisma.websiteContent.update({
      where: { id: existing.id },
      data: {
        ...(body.about !== undefined && { about: body.about }),
        ...(body.mission !== undefined && { mission: body.mission }),
        ...(body.vision !== undefined && { vision: body.vision }),
        ...(body.goals !== undefined && { goals: body.goals }),
      },
    });

    return NextResponse.json<ApiResponse<WebsiteContentData>>({
      success: true,
      data: content as unknown as WebsiteContentData,
      message: "Content updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/content error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update content" },
      { status: 500 }
    );
  }
}
