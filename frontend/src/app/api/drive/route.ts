import { NextRequest, NextResponse } from "next/server";
import { fetchDriveImages, parseFolderId } from "@/lib/google-drive";
import type { ApiResponse, DriveFile } from "@/types";

// ─── GET /api/drive?folderId=... — Fetch images from a Google Drive folder ──
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderIdParam = searchParams.get("folderId");

    if (!folderIdParam) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required query parameter: folderId" },
        { status: 400 }
      );
    }

    const folderId = parseFolderId(folderIdParam);
    const files = await fetchDriveImages(folderId);

    return NextResponse.json<ApiResponse<DriveFile[]>>({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("GET /api/drive error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch drive images";

    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
