"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectEmbedSource } from "@/lib/media";
import type { MediaAssetRecord } from "@/types/media";

interface MediaCarouselProps {
  assets: MediaAssetRecord[];
  className?: string;
}

export const MediaCarousel = ({ assets, className }: MediaCarouselProps) => {
  const [index, setIndex] = useState(0);
  const current = assets[index];
  const embed = useMemo(() => (current ? detectEmbedSource(current.uri) : null), [current]);

  if (!assets.length) {
    return (
      <div className={cn("flex h-56 items-center justify-center rounded-xl border border-dashed border-border/50", className)}>
        <p className="text-sm text-muted-foreground">Media uploads will appear here once attached.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setIndex((prev) => (prev === 0 ? assets.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === assets.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border/60", className)}>
      {current && current.type === "video" && embed ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={current.id}
            src={embed.embedUrl}
            title={current.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <span className="sr-only">{current.title}</span>
        </div>
      ) : (
        <div className="relative aspect-video w-full">
          <Image
            src={current?.uri ?? "/placeholder.png"}
            alt={current?.title ?? "Media"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {current?.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      )}

      <div className="absolute inset-y-0 flex w-full items-center justify-between px-2">
        <button
          type="button"
          className="rounded-full bg-background/80 p-1 text-muted-foreground shadow"
          onClick={handlePrevious}
          aria-label="Previous media"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-full bg-background/80 p-1 text-muted-foreground shadow"
          onClick={handleNext}
          aria-label="Next media"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-background/70 px-4 py-2 text-xs">
        <div>
          <p className="font-medium text-foreground">{current?.title}</p>
          {current?.attribution?.contributorName && (
            <p className="text-muted-foreground">
              © {current.attribution.contributorName}
              {current.attribution.license ? ` • ${current.attribution.license}` : ""}
            </p>
          )}
        </div>
        <span className="text-muted-foreground">
          {index + 1} / {assets.length}
        </span>
      </div>
    </div>
  );
};
