"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Lightbox from "@/components/gallery/Lightbox";
import type { GalleryAlbumData, DriveFile } from "@/types";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  album?: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch gallery albums");
        return res.json();
      })
      .then(async (resData) => {
        if (resData.success && resData.data && resData.data.length > 0) {
          const albumsList = resData.data;
          
          // For each album, fetch its images from Google Drive API proxy
          const allImagesPromises = albumsList.map(async (album: GalleryAlbumData) => {
            try {
              const driveRes = await fetch(`/api/drive?folderId=${album.googleDriveFolderId}`);
              const driveData = await driveRes.json();
              if (!driveRes.ok) {
                throw new Error(driveData.error || `HTTP ${driveRes.status}`);
              }
              if (driveData.success && driveData.data) {
                return driveData.data.map((file: DriveFile) => ({
                  id: file.id,
                  url: file.displayUrl,
                  alt: file.name || album.title,
                  album: album.title,
                }));
              }
            } catch (err) {
              console.error(`Failed to fetch images for album ${album.title}:`, err);
              const errMsg = err instanceof Error ? err.message : "Failed to load Google Drive folder";
              setError(`Album "${album.title}": ${errMsg}`);
            }
            return [];
          });

          const resolvedImagesArrays = await Promise.all(allImagesPromises);
          const flatImages = resolvedImagesArrays.flat();
          setImages(flatImages);
        } else {
          setImages([]);
        }
      })
      .catch((err) => {
        console.error("Gallery page load error:", err);
        setError("Could not load gallery images. Please check your Google Drive API key.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const albums = ["all", ...Array.from(new Set(images.map((img) => img.album).filter(Boolean)))];

  const filteredImages =
    selectedAlbum === "all"
      ? images
      : images.filter((img) => img.album === selectedAlbum);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text">Gallery</h1>
          <p className="mt-3 text-text-secondary max-w-xl mx-auto">
            Capturing moments of change, community, and hope through our
            initiatives.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-text-secondary font-medium">Fetching gallery from Google Drive...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-10 bg-error/10 border border-error/20 rounded-xl max-w-md mx-auto mb-10">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && (
          <div className="text-center py-20 bg-white border border-border rounded-xl max-w-md mx-auto">
            <svg
              className="h-12 w-12 text-text-light mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-text mb-1">No images found</h3>
            <p className="text-text-secondary text-sm px-4">
              Add some Google Drive folders in the admin dashboard to populate the gallery.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && images.length > 0 && (
          <>
            {/* Album Filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-2 mb-10"
            >
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setSelectedAlbum(album as string)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    selectedAlbum === album
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {album === "all" ? "All Photos" : album}
                </button>
              ))}
            </motion.div>

            {/* Gallery Grid */}
            <GalleryGrid
              images={filteredImages}
              onImageClick={(index) => setLightboxIndex(index)}
            />

            {/* Lightbox */}
            <Lightbox
              images={filteredImages}
              currentIndex={lightboxIndex}
              isOpen={lightboxIndex >= 0}
              onClose={() => setLightboxIndex(-1)}
              onPrev={() =>
                setLightboxIndex((prev) =>
                  prev > 0 ? prev - 1 : filteredImages.length - 1
                )
              }
              onNext={() =>
                setLightboxIndex((prev) =>
                  prev < filteredImages.length - 1 ? prev + 1 : 0
                )
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
