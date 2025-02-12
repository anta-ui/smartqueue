"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState("");

  useEffect(() => {
    // Générer une version floue de l'image pour le chargement progressif
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 40;
      canvas.height = Math.floor((40 * height) / width);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBlurDataUrl(canvas.toDataURL("image/jpeg", 0.5));
      };
    }
  }, [src, width, height]);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: width / height }}>
      {isLoading && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Failed to load image</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setError(true)}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataUrl || "data:image/jpeg;base64,/9j/4AAQSkZJRg=="}
        />
      )}
    </div>
  );
}
