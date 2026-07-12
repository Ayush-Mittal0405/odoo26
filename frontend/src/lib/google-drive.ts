import type { DriveFile, DriveApiResponse, DriveFolderCache } from "@/types";

// ─── In-memory cache ─────────────────────────────────
const cache = new Map<string, DriveFolderCache>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Parse folder ID from Google Drive URLs ──────────
export function parseFolderId(input: string): string {
  // Already a plain folder ID (no slashes, no URL-like chars)
  if (/^[\w-]+$/.test(input) && !input.includes("http")) {
    return input;
  }

  // Handle full URLs
  const patterns = [
    // https://drive.google.com/drive/folders/FOLDER_ID?usp=...
    /drive\.google\.com\/drive\/folders\/([\w-]+)/,
    // https://drive.google.com/drive/u/0/folders/FOLDER_ID
    /drive\.google\.com\/drive\/u\/\d+\/folders\/([\w-]+)/,
    // https://drive.google.com/open?id=FOLDER_ID
    /drive\.google\.com\/open\?id=([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  // Fallback: treat entire input as folder ID
  return input.trim();
}

// ─── Fetch images from a Google Drive folder ─────────
export async function fetchDriveImages(
  folderId: string,
  apiKey?: string
): Promise<DriveFile[]> {
  const key = apiKey ?? process.env.GOOGLE_DRIVE_API_KEY;

  if (!key) {
    throw new Error("GOOGLE_DRIVE_API_KEY is not configured");
  }

  // Check cache first
  const cached = cache.get(folderId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.files;
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
  url.searchParams.set("key", key);
  url.searchParams.set("fields", "files(id,name,mimeType,thumbnailLink)");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("orderBy", "name");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }, // 5 min ISR cache in Next.js
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google Drive API error (${response.status}):`, errorBody);
    throw new Error(`Google Drive API returned ${response.status}`);
  }

  const data: DriveApiResponse = await response.json();

  const files: DriveFile[] = (data.files ?? []).map((file) => {
    let displayUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
    if (file.thumbnailLink) {
      const baseUrl = file.thumbnailLink.split("=")[0];
      displayUrl = `${baseUrl}=s0`;
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      thumbnailLink: file.thumbnailLink,
      displayUrl,
    };
  });

  // Update cache
  cache.set(folderId, { files, cachedAt: Date.now() });

  return files;
}

// ─── Invalidate cache for a specific folder ──────────
export function invalidateDriveCache(folderId: string): void {
  cache.delete(folderId);
}

// ─── Clear entire drive cache ────────────────────────
export function clearDriveCache(): void {
  cache.clear();
}
