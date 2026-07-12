/* ──────────────────────────────────────────────
   Pavitrarpan Foundation – Shared TypeScript Types
   ────────────────────────────────────────────── */

// ─── NextAuth type augmentation ──────────────────────
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ─── Generic API response wrapper ────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── User ────────────────────────────────────────────
export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Event ───────────────────────────────────────────
export interface EventData {
  id: number;
  title: string;
  description: string;
  banner: string | null;
  date: string;
  time: string | null;
  venue: string;
  registrationLink: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  banner?: string;
  date: string;
  time?: string;
  venue: string;
  registrationLink?: string;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  featured?: boolean;
}

export type UpdateEventInput = Partial<CreateEventInput>;

// ─── Gallery ─────────────────────────────────────────
export interface GalleryAlbumData {
  id: number;
  title: string;
  eventDate: string;
  googleDriveFolderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryAlbumInput {
  title: string;
  eventDate: string;
  googleDriveFolderId: string;
}

export type UpdateGalleryAlbumInput = Partial<CreateGalleryAlbumInput>;

// ─── Website Content ─────────────────────────────────
export interface WebsiteContentData {
  id: number;
  about: string;
  mission: string;
  vision: string;
  goals: string;
  updatedAt: string;
}

export interface UpdateWebsiteContentInput {
  about?: string;
  mission?: string;
  vision?: string;
  goals?: string;
}

// ─── Statistics ──────────────────────────────────────
export interface StatisticsData {
  id: number;
  treesPlanted: number;
  cleanlinessDrives: number;
  volunteers: number;
  studentsEducated: number;
  eventsConducted: number;
  updatedAt: string;
}

export interface UpdateStatisticsInput {
  treesPlanted?: number;
  cleanlinessDrives?: number;
  volunteers?: number;
  studentsEducated?: number;
  eventsConducted?: number;
}

// ─── Google Drive ────────────────────────────────────
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  displayUrl: string;
}

export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export interface DriveApiResponse {
  files: DriveApiFile[];
}

export interface DriveFolderCache {
  files: DriveFile[];
  cachedAt: number;
}
