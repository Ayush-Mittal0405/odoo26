"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { GalleryAlbumData, DriveFile } from "@/types";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export default function FeaturedGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(async (resData) => {
        if (resData.success && resData.data && resData.data.length > 0) {
          const albumsList = resData.data;
          
          // Get the most recent album or first few albums
          const recentAlbums = albumsList.slice(0, 2);
          
          const allImagesPromises = recentAlbums.map(async (album: GalleryAlbumData) => {
            try {
              const driveRes = await fetch(`/api/drive?folderId=${album.googleDriveFolderId}`);
              if (!driveRes.ok) return [];
              const driveData = await driveRes.json();
              if (driveData.success && driveData.data) {
                return driveData.data.map((file: DriveFile) => ({
                  id: file.id,
                  url: file.displayUrl,
                  alt: file.name || album.title,
                }));
              }
            } catch (err) {
              console.error(err);
            }
            return [];
          });

          const resolvedImagesArrays = await Promise.all(allImagesPromises);
          const flatImages = resolvedImagesArrays.flat().slice(0, 6);
          setImages(flatImages);
        } else {
          setImages([]);
        }
      })
      .catch((err) => {
        console.error("Featured gallery load error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Our Gallery
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
            Moments of Impact
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            A glimpse into our initiatives, events, and the communities we serve
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-10 text-text-secondary">
            No gallery images configured yet.
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl aspect-square group cursor-pointer ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 text-center"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
          >
            View Full Gallery
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
