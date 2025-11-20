"use client";

import type { ReactNode } from "react";
import type { MediaAsset } from "@/types/media";
import { ExternalLink, Film, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  assets: MediaAsset[];
  loading?: boolean;
}

const typeIcon: Record<MediaAsset["type"], ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />, 
  video: <Film className="h-4 w-4" />, 
  document: <FileText className="h-4 w-4" />, 
  external_video: <Film className="h-4 w-4" />, 
  link: <LinkIcon className="h-4 w-4" />, 
  text: <FileText className="h-4 w-4" />,
};

export const MediaCarousel = ({ assets, loading }: MediaCarouselProps) => {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-32 animate-pulse rounded-lg border border-border/30 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
        No media have been attached yet. Upload field photos or link a YouTube/Vimeo clip to showcase this record.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {assets.map((asset) => {
        const isEmbed = asset.type === "external_video" || asset.type === "video";
        const isText = asset.type === "text";
        return (
          <div
            key={asset.id}
            className="relative overflow-hidden rounded-lg border border-border/50 bg-background/60 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="flex items-center gap-1 capitalize">
                {typeIcon[asset.type]}
                {asset.type.replace("_", " ")}
              </Badge>
              {asset.attribution?.author && (
                <span className="truncate">© {asset.attribution.author}</span>
              )}
            </div>

            <div
              className={cn(
                "relative flex min-h-[150px] flex-col gap-2 p-3",
                isEmbed && "bg-black/60 text-white",
                isText && "text-sm text-muted-foreground"
              )}
            >
              {asset.type === "image" && (
                <div
                  className="h-36 w-full rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${asset.uri})` }}
                  aria-label={asset.title ?? "Media asset"}
                />
              )}

              {isEmbed && (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
                  <iframe
                    src={asset.uri}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={asset.title ?? "Embedded media"}
                  />
                </div>
              )}

              {asset.type === "document" || asset.type === "link" ? (
                <a
                  href={asset.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {asset.title ?? asset.uri}
                </a>
              ) : null}

              {isText && (
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed">{asset.uri}</p>
              )}

              {asset.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">{asset.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
