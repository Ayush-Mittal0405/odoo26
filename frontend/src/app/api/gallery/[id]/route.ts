import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseFolderId } from "@/lib/google-drive";
import type { ApiResponse, GalleryAlbumData, UpdateGalleryAlbumInput } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// ─── GET /api/gallery/[id] — Fetch single album ─────
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const albumId = parseInt(id, 10);

    if (isNaN(albumId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid album ID" },
        { status: 400 }
      );
    }

    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<GalleryAlbumData>>({
      success: true,
      data: album as unknown as GalleryAlbumData,
    });
  } catch (error) {
    console.error("GET /api/gallery/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/gallery/[id] — Update album (admin) ───
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
    const albumId = parseInt(id, 10);

    if (isNaN(albumId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid album ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    const body: UpdateGalleryAlbumInput = await request.json();

    const album = await prisma.galleryAlbum.update({
      where: { id: albumId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.eventDate !== undefined && { eventDate: new Date(body.eventDate) }),
        ...(body.googleDriveFolderId !== undefined && {
          googleDriveFolderId: parseFolderId(body.googleDriveFolderId),
        }),
      },
    });

    return NextResponse.json<ApiResponse<GalleryAlbumData>>({
      success: true,
      data: album as unknown as GalleryAlbumData,
      message: "Album updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/gallery/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update album" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/gallery/[id] — Delete album (admin) ─
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
    const albumId = parseInt(id, 10);

    if (isNaN(albumId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid album ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    await prisma.galleryAlbum.delete({ where: { id: albumId } });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
