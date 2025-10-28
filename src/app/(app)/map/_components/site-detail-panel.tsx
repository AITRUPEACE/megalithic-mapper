"use client";

import type { MapSite } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SiteDetailPanelProps {
  site: MapSite | null;
}

const statusVariant: Record<MapSite["verificationStatus"], "success" | "warning" | "outline"> = {
  verified: "success",
  under_review: "warning",
  unverified: "outline",
};

export const SiteDetailPanel = ({ site }: SiteDetailPanelProps) => {
  if (!site) {
    return (
      <div className="glass-panel border-border/40 p-6 text-sm text-muted-foreground">
        Select a site marker or list item to view research connections, metadata, and next steps.
      </div>
    );
  }

  return (
    <Card className="glass-panel border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-semibold">{site.name}</CardTitle>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {site.civilization} • {site.era}
            </p>
          </div>
          <Badge variant={statusVariant[site.verificationStatus]}>
            {site.verificationStatus === "verified" && "Verified"}
            {site.verificationStatus === "under_review" && "Under review"}
            {site.verificationStatus === "unverified" && "Community entry"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{site.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary/40 px-3 py-1">{site.siteType}</span>
          <span className="rounded-full bg-secondary/40 px-3 py-1">{site.mediaCount} media assets</span>
          <span className="rounded-full bg-secondary/40 px-3 py-1">
            {site.relatedResearchIds.length} research links
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {site.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next actions</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/research?site=${site.id}`}>Open in Research Hub</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/forum?site=${site.id}`}>Discuss with community</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
