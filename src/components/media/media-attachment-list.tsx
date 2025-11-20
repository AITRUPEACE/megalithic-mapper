"use client";

import type { JSX } from "react";
import type { MediaAsset } from "@/types/media";
import { ExternalLink, FileText, Link as LinkIcon, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MediaAttachmentListProps {
  assets: MediaAsset[];
  loading?: boolean;
}

const iconForType: Record<MediaAsset["type"], JSX.Element> = {
  document: <FileText className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
  text: <NotebookPen className="h-4 w-4" />,
  image: <FileText className="h-4 w-4" />,
  video: <FileText className="h-4 w-4" />,
  external_video: <FileText className="h-4 w-4" />,
};

export const MediaAttachmentList = ({ assets, loading }: MediaAttachmentListProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`attachment-skeleton-${index}`}
            className="h-12 animate-pulse rounded-md border border-border/30 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-background/60 p-5 text-sm text-muted-foreground">
        No documents or text snippets have been attached yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            {iconForType[asset.type]}
            <div>
              <p className="text-sm font-medium text-foreground">{asset.title ?? "Untitled attachment"}</p>
              {asset.description && (
                <p className="text-xs text-muted-foreground">{asset.description}</p>
              )}
              {asset.attribution?.author && (
                <p className="text-xs text-muted-foreground">Source: {asset.attribution.author}</p>
              )}
            </div>
          </div>
          {asset.type === "text" ? (
            <Badge variant="outline">Inline note</Badge>
          ) : (
            <a
              href={asset.uri}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
