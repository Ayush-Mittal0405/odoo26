import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseFolderId } from "@/lib/google-drive";
import type { ApiResponse, GalleryAlbumData, CreateGalleryAlbumInput } from "@/types";

// ─── GET /api/gallery — List all albums ──────────────
export async function GET() {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      orderBy: { eventDate: "desc" },
    });

    return NextResponse.json<ApiResponse<GalleryAlbumData[]>>({
      success: true,
      data: albums as unknown as GalleryAlbumData[],
    });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch gallery albums" },
      { status: 500 }
    );
  }
}

// ─── POST /api/gallery — Create album (admin only) ───
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreateGalleryAlbumInput = await request.json();

    if (!body.title || !body.eventDate || !body.googleDriveFolderId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required fields: title, eventDate, googleDriveFolderId" },
        { status: 400 }
      );
    }

    // Parse the folder ID in case a full URL was provided
    const folderId = parseFolderId(body.googleDriveFolderId);

    const album = await prisma.galleryAlbum.create({
      data: {
        title: body.title,
        eventDate: new Date(body.eventDate),
        googleDriveFolderId: folderId,
      },
    });

    return NextResponse.json<ApiResponse<GalleryAlbumData>>(
      { success: true, data: album as unknown as GalleryAlbumData, message: "Album created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create album" },
      { status: 500 }
    );
  }
}
