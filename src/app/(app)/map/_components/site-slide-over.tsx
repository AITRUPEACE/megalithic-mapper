"use client";

import { useEffect, useRef } from "react";
import { X, ExternalLink, MapPin, MessageSquare, Image, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn, timeAgo } from "@/shared/lib/utils";
import type { MapSiteFeature } from "@/entities/map/model/types";
import Link from "next/link";

interface SiteSlideOverProps {
  site: MapSiteFeature | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const statusVariant: Record<MapSiteFeature["verificationStatus"], "success" | "warning" | "outline"> = {
  verified: "success",
  under_review: "warning",
  unverified: "outline",
};

const communityTierLabel: Record<NonNullable<MapSiteFeature["trustTier"]>, string> = {
  bronze: "Community Bronze",
  silver: "Community Silver",
  gold: "Community Gold",
  promoted: "Promoted to Official",
};

export function SiteSlideOver({ site, isOpen, onClose, className }: SiteSlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const isCommunity = site?.layer === "community";
  const tierLabel = site?.trustTier ? communityTierLabel[site.trustTier] : undefined;

  return (
    <AnimatePresence>
      {isOpen && site && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border/40 bg-card shadow-2xl",
              "lg:w-[420px]",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/40 p-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-lg truncate">{site.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {site.tags.cultures[0] || "Unknown"} · {site.tags.eras[0] || "Unknown era"}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant={statusVariant[site.verificationStatus]}>
                    {site.verificationStatus === "verified" && "Verified"}
                    {site.verificationStatus === "under_review" && "Under review"}
                    {site.verificationStatus === "unverified" && "Unverified"}
                  </Badge>
                  <Badge variant={isCommunity ? "outline" : "secondary"}>
                    {isCommunity ? tierLabel ?? "Community" : "Official"}
                  </Badge>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100%-140px)]">
              <Tabs defaultValue="overview" className="p-4">
                <TabsList className="w-full justify-start gap-1 bg-muted/30 p-1">
                  <TabsTrigger value="overview" className="text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs">
                    <Image className="h-3 w-3 mr-1" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Discussion
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  {/* Summary */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {site.summary}
                  </p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-lg font-semibold">{site.mediaCount}</p>
                      <p className="text-xs text-muted-foreground">Media</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-lg font-semibold">{site.relatedResearchIds.length}</p>
                      <p className="text-xs text-muted-foreground">Research</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                      <p className="text-lg font-semibold">{site.zoneMemberships.length}</p>
                      <p className="text-xs text-muted-foreground">Zones</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {site.tags.themes.map((tag) => (
                        <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          #{tag}
                        </span>
                      ))}
                      {site.tags.cultures.map((tag) => (
                        <span key={`c-${tag}`} className="rounded-full bg-secondary/30 px-2.5 py-1 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Zones */}
                  {site.zoneMemberships.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Research Zones</p>
                      <div className="flex flex-wrap gap-1.5">
                        {site.zoneMemberships.map((zone) => (
                          <span 
                            key={zone.id} 
                            className="rounded-full px-2.5 py-1 text-xs"
                            style={{ backgroundColor: `${zone.color}22`, color: zone.color }}
                          >
                            {zone.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coordinates */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
                    </span>
                  </div>

                  {/* Evidence links */}
                  {site.evidenceLinks && site.evidenceLinks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidence</p>
                      <div className="space-y-1">
                        {site.evidenceLinks.map((link) => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {new URL(link).hostname}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    Updated {timeAgo(site.updatedAt)} by @{site.updatedBy}
                  </div>
                </TabsContent>

                <TabsContent value="media" className="mt-4">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Image className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {site.mediaCount > 0
                        ? `${site.mediaCount} media items`
                        : "No media uploaded yet"}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Upload Media
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="mt-4">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Start or join the discussion
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      View Discussion
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            {/* Footer actions */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-card p-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/research?site=${site.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Research Hub
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/forum?site=${site.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discuss
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

