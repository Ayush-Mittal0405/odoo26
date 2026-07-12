"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  album?: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

const placeholderColors = [
  "from-primary/20 to-secondary/10",
  "from-secondary/20 to-accent/10",
  "from-accent/15 to-primary/20",
  "from-primary-dark/15 to-secondary/20",
  "from-secondary-light/25 to-primary/15",
  "from-accent/20 to-secondary-light/20",
];

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
          className="break-inside-avoid cursor-pointer group"
          onClick={() => onImageClick(index)}
        >
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            {image.url ? (
              <>
                {!loadedImages.has(image.id) && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  onLoad={() => handleImageLoad(image.id)}
                  className={`w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ${
                    loadedImages.has(image.id) ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            ) : (
              <div
                className={`w-full aspect-[${
                  index % 3 === 0 ? "4/5" : index % 3 === 1 ? "1/1" : "3/4"
                }] bg-gradient-to-br ${
                  placeholderColors[index % placeholderColors.length]
                } flex items-center justify-center min-h-[200px] ${
                  index % 3 === 0 ? "min-h-[280px]" : index % 3 === 1 ? "min-h-[220px]" : "min-h-[240px]"
                }`}
              >
                <div className="text-center p-4">
                  <svg
                    className="h-10 w-10 text-primary/20 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                  <span className="text-xs text-text-secondary font-medium">
                    {image.alt}
                  </span>
                </div>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            </div>
          </div>
          {image.album && (
            <p className="mt-1.5 text-xs text-text-light px-1">{image.album}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
