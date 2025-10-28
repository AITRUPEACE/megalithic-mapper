"use client";

import type { MapSite } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";

interface SiteListProps {
  sites: MapSite[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
}

const verificationLabel: Record<MapSite["verificationStatus"], string> = {
  verified: "Verified",
  under_review: "Under review",
  unverified: "Unverified",
};

export const SiteList = ({ sites, selectedSiteId, onSelect }: SiteListProps) => {
  if (!sites.length) {
    return (
      <div className="glass-panel border-border/40 p-6 text-sm text-muted-foreground">
        No sites match the current filters. Try widening your civilization or verification criteria.
      </div>
    );
  }

  return (
    <div className="glass-panel border-border/40">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{sites.length} mapped entries</p>
        <Badge variant="secondary">Beta dataset</Badge>
      </div>
      <ScrollArea className="h-[420px]">
        <ul className="space-y-2 p-3">
          {sites.map((site) => {
            const isSelected = site.id === selectedSiteId;
            return (
              <li key={site.id}>
                <button
                  className={cn(
                    "w-full rounded-lg border border-transparent px-4 py-3 text-left transition",
                    isSelected ? "bg-primary/15 border-primary/40" : "hover:bg-secondary/30"
                  )}
                  onClick={() => onSelect(site.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{site.name}</p>
                    <Badge variant={site.verificationStatus === "verified" ? "success" : "outline"}>
                      {verificationLabel[site.verificationStatus]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {site.civilization} • {site.era}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{site.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {site.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                    <span>• Updated {timeAgo(site.lastUpdated)}</span>
                    {site.relatedResearchIds.length > 0 && (
                      <span className="rounded-full bg-primary/15 px-2 py-1 text-primary text-[11px] uppercase tracking-wide">
                        Research linked
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
        Looking for something specific? Use the filters to narrow by civilization, verification status, or research linkage.
      </div>
    </div>
  );
};
