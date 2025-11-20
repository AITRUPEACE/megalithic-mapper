"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  type: "image" | "video";
  title?: string;
  src?: string;
  placeholder?: React.ReactNode;
}

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

export function MediaCarousel({ items, className }: MediaCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const active = items[index];

  const handlePrevious = () => setIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));

  if (!items.length) {
    return (
      <div className={cn("flex h-40 items-center justify-center rounded-lg border border-dashed", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>Media gallery coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border/40 bg-muted/40 p-3", className)}>
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-lg bg-background">
        {active?.placeholder ?? (
          <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
            {active.type === "video" ? <Play className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            <span>{active.title ?? "Media slot"}</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <Button size="icon" variant="ghost" onClick={handlePrevious} aria-label="Previous media">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "h-2 w-2 rounded-full transition",
                itemIndex === index ? "bg-primary" : "bg-border"
              )}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Show media ${itemIndex + 1}`}
            />
          ))}
        </div>
        <Button size="icon" variant="ghost" onClick={handleNext} aria-label="Next media">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
