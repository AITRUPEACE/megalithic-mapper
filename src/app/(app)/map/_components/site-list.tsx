"use client";

import type { MapSite } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";

interface SiteListProps {
  sites: MapSite[];
  selectedSiteId: string | null;
  onSelect: (siteId: string) => void;
  className?: string;
  scrollClassName?: string;
  variant?: "card" | "flat";
}

const verificationLabel: Record<MapSite["verificationStatus"], string> = {
  verified: "Verified",
  under_review: "Under review",
  unverified: "Unverified",
};

const communityTierLabel: Record<NonNullable<MapSite["trustTier"]>, string> = {
  bronze: "Community Bronze",
  silver: "Community Silver",
  gold: "Community Gold",
  promoted: "Promoted to Official",
};

export const SiteList = ({ sites, selectedSiteId, onSelect, className, scrollClassName, variant = "card" }: SiteListProps) => {
  if (!sites.length) {
    const emptyClasses =
      variant === "card"
        ? "glass-panel border-border/40 p-6 text-sm text-muted-foreground"
        : "flex h-full flex-col justify-center rounded-xl border border-border/40 bg-background/15 p-6 text-sm text-muted-foreground";
    return (
      <div className={cn(emptyClasses, className)}>
        No sites match the current filters. Try widening your civilization or verification criteria.
      </div>
    );
  }

  const containerClasses =
    variant === "card"
      ? "glass-panel flex h-full flex-col border-border/40"
      : "flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-background/15";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{sites.length} mapped entries</p>
        <Badge variant="secondary">Beta dataset</Badge>
      </div>
      <ScrollArea className={cn("flex-1", scrollClassName)}>
        <ul className="space-y-2 p-3">
          {sites.map((site) => {
            const isSelected = site.id === selectedSiteId;
            const isCommunity = site.layer === "community";
            const tierLabel = site.trustTier ? communityTierLabel[site.trustTier] : undefined;

            return (
              <li key={site.id}>
                <button
                  className={cn(
                    "w-full rounded-lg border border-transparent px-4 py-3 text-left transition",
                    isSelected ? "bg-primary/15 border-primary/40" : "hover:bg-secondary/30"
                  )}
                  onClick={() => onSelect(site.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{site.name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={site.verificationStatus === "verified" ? "success" : "outline"}>
                        {verificationLabel[site.verificationStatus]}
                      </Badge>
                      <Badge variant={isCommunity ? "outline" : "secondary"}>
                        {isCommunity ? tierLabel ?? "Community" : "Official"}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {site.civilization} - {site.era}
                  </p>
                  {site.geography.zone && (
                    <p className="mt-1 text-xs font-semibold text-primary">
                      📍 {site.geography.zone}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{site.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-[11px]">
                      {site.geography.country}
                    </span>
                    {site.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                    <span>Updated {timeAgo(site.lastUpdated)}</span>
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
