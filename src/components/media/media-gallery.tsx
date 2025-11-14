import Image from "next/image";
import { ExternalLink, PlayCircle } from "lucide-react";
import Link from "next/link";

import type { MediaAssetRecord } from "@/types/media";
import { detectEmbedSource } from "@/lib/media";
import { cn, timeAgo } from "@/lib/utils";

interface MediaGalleryProps {
  assets: MediaAssetRecord[];
  className?: string;
}

export const MediaGallery = ({ assets, className }: MediaGalleryProps) => {
  if (!assets.length) {
    return (
      <div className={cn("rounded-lg border border-dashed border-border/50 p-4 text-sm text-muted-foreground", className)}>
        No media have been attached to this entity yet.
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      {assets.map((asset) => {
        const embed = detectEmbedSource(asset.uri);
        return (
          <div key={asset.id} className="glass-panel flex flex-col overflow-hidden border border-border/40">
            <div className="relative aspect-video w-full">
              <Image
                src={asset.thumbnailUrl ?? asset.uri}
                alt={asset.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {asset.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{asset.title}</p>
                {asset.description && <p className="text-xs text-muted-foreground">{asset.description}</p>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                {asset.attribution?.contributorHandle && <span>@{asset.attribution.contributorHandle}</span>}
                <span>{timeAgo(asset.createdAt)}</span>
              </div>
              <div className="mt-auto flex items-center justify-between text-xs">
                <span className="rounded-full bg-secondary/40 px-2 py-1 text-muted-foreground">{asset.type}</span>
                <Link
                  href={embed?.url ?? asset.uri}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  target="_blank"
                >
                  View asset <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
