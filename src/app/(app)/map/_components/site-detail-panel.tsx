"use client";

import { useEffect, useMemo, useState } from "react";
import type { MapSiteFeature } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { MediaAsset } from "@/types/media";
import { MediaCarousel } from "@/components/media/media-carousel";
import { MediaAttachmentList } from "@/components/media/media-attachment-list";

interface SiteDetailPanelProps {
site: MapSiteFeature | null;
className?: string;
variant?: "card" | "flat";
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

const categoryLabel: Record<MapSiteFeature["category"], string> = {
  site: "Site",
  artifact: "Artifact",
  text: "Text source",
};

export const SiteDetailPanel = ({ site, className, variant = "card" }: SiteDetailPanelProps) => {
        const [activeTab, setActiveTab] = useState("overview");
        const [loadedTabs, setLoadedTabs] = useState({ media: false, documents: false });
        const [loadingTab, setLoadingTab] = useState<"media" | "documents" | null>(null);
        const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
        const [documentAssets, setDocumentAssets] = useState<MediaAsset[]>([]);

        const buildMockAssets = useMemo(
                () =>
                        (currentSite: MapSiteFeature, category: "media" | "documents"): MediaAsset[] => {
                                const baseTarget = { entityId: currentSite.id, entityType: "site" as const };
                                if (category === "media") {
                                        return [
                                                {
                                                        id: `mock-image-${currentSite.id}`,
                                                        type: "image",
                                                        uri: `https://placehold.co/640x360?text=${encodeURIComponent(currentSite.name)}`,
                                                        title: `${currentSite.name} overview`,
                                                        description: "Placeholder preview. Upload images via Supabase storage to replace.",
                                                        target: baseTarget,
                                                        attribution: { author: "Field archivist" },
                                                        createdAt: new Date().toISOString(),
                                                },
                                                {
                                                        id: `mock-video-${currentSite.id}`,
                                                        type: "external_video",
                                                        uri: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                                                        title: "Expedition footage",
                                                        description: "Example YouTube embed placeholder.",
                                                        target: baseTarget,
                                                        attribution: { author: "Expedition media" },
                                                        createdAt: new Date().toISOString(),
                                                },
                                        ];
                                }

                                return [
                                        {
                                                id: `mock-doc-${currentSite.id}`,
                                                type: "document",
                                                uri: "https://example.com/field-notes.pdf",
                                                title: "Field notes PDF",
                                                description: "Attach survey notes, citations, or scans for review.",
                                                target: baseTarget,
                                                attribution: { author: "Research desk" },
                                                createdAt: new Date().toISOString(),
                                        },
                                        {
                                                id: `mock-text-${currentSite.id}`,
                                                type: "text",
                                                uri: "Add short observations or captions to contextualize the gallery.",
                                                title: "Inline annotation",
                                                target: baseTarget,
                                                attribution: null,
                                                createdAt: new Date().toISOString(),
                                        },
                                ];
                        },
                []
        );

        useEffect(() => {
                if (!site) {
                        setMediaAssets([]);
                        setDocumentAssets([]);
                        setActiveTab("overview");
                        return;
                }

                setActiveTab("overview");
                setLoadedTabs({ media: false, documents: false });
                setLoadingTab(null);
                setMediaAssets(site.mediaAssets ?? []);
                setDocumentAssets(site.documentAssets ?? []);
        }, [site?.id]);

        const loadMediaTab = (targetTab: "media" | "documents") => {
                if (!site || loadedTabs[targetTab]) return;
                setLoadingTab(targetTab);
                const fallbackAssets =
                        targetTab === "media"
                                ? site.mediaAssets?.length
                                        ? site.mediaAssets
                                        : buildMockAssets(site, "media")
                                : site.documentAssets?.length
                                        ? site.documentAssets
                                        : buildMockAssets(site, "documents");

                setTimeout(() => {
                        if (targetTab === "media") {
                                setMediaAssets(fallbackAssets);
                        } else {
                                setDocumentAssets(fallbackAssets);
                        }

                        setLoadedTabs((prev) => ({ ...prev, [targetTab]: true }));
                        setLoadingTab(null);
                }, 240);
        };

        const handleTabChange = (value: string) => {
                setActiveTab(value);
                if (value === "media") {
                        loadMediaTab("media");
                }
                if (value === "documents") {
                        loadMediaTab("documents");
                }
        };

        if (!site) {
		const emptyClasses =
			variant === "card"
				? "glass-panel border-border/40 p-6 text-sm text-muted-foreground"
				: "flex h-full flex-col justify-center rounded-xl border border-border/40 bg-background/15 p-6 text-sm text-muted-foreground";
		return (
			<div className={cn(emptyClasses, className)}>
				Select a site marker or list item to view research connections, metadata, and next steps.
			</div>
		);
	}

	const isCommunity = site.layer === "community";
	const tierLabel = site.trustTier ? communityTierLabel[site.trustTier] : undefined;
	const layerBadgeVariant = isCommunity ? ("outline" as const) : ("secondary" as const);
	const layerBadgeText = isCommunity ? tierLabel ?? "Community submission" : "Official dataset";

const header = (
<div className="flex flex-wrap items-center justify-between gap-3">
<div>
<CardTitle className="text-xl font-semibold">{site.name}</CardTitle>
<p className="text-xs uppercase tracking-wide text-muted-foreground">
{site.tags.cultures[0] ?? "Unattributed"} - {site.tags.eras[0] ?? "Unknown era"}
</p>
</div>
                        <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{categoryLabel[site.category]}</Badge>
                                <Badge variant={statusVariant[site.verificationStatus]}>
                                        {site.verificationStatus === "verified" && "Verified"}
					{site.verificationStatus === "under_review" && "Under review"}
					{site.verificationStatus === "unverified" && "Unverified submission"}
				</Badge>
				<Badge variant={layerBadgeVariant}>{layerBadgeText}</Badge>
			</div>
		</div>
	);

        const tabs = (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full flex-col gap-4">
                        <TabsList className="flex w-full gap-2 overflow-x-auto rounded-md bg-background/40 p-1 text-xs">
                                <TabsTrigger value="overview" className="shrink-0 px-3 py-1">
                                        Overview
                                </TabsTrigger>
                                <TabsTrigger value="media" className="shrink-0 px-3 py-1">
                                        Media
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="shrink-0 px-3 py-1">
                                        Documents
                                </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 text-sm text-muted-foreground">
<p>{site.summary}</p>

                                <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-secondary/40 px-3 py-1">{site.siteType}</span>
                                        <span className="rounded-full bg-secondary/40 px-3 py-1">{site.mediaCount} media assets</span>
                                        <span className="rounded-full bg-secondary/40 px-3 py-1">{site.relatedResearchIds.length} research links</span>
                                        <span className="rounded-full bg-secondary/40 px-3 py-1">{categoryLabel[site.category]}</span>
                                </div>

				{isCommunity && (
					<div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-xs">
						<p className="font-semibold text-foreground">Community contribution</p>
						<p className="mt-1">
							Current tier: {tierLabel ?? "Bronze"}. Upvote credibility, add supporting evidence, or request moderator review to promote this
							submission to the Official map.
						</p>
					</div>
				)}

<div className="space-y-2">
<p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
<div className="flex flex-wrap gap-2 text-xs">
{site.tags.themes.map((tag) => (
<span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
#{tag}
</span>
))}
{site.tags.cultures.map((tag) => (
<span key={`culture-${tag}`} className="rounded-full bg-secondary/30 px-3 py-1 text-secondary-foreground">
{tag}
</span>
))}
</div>
</div>

{site.zoneMemberships.length > 0 && (
<div className="space-y-2 text-xs">
<p className="uppercase tracking-wide text-muted-foreground">Zones</p>
<div className="flex flex-wrap gap-2">
{site.zoneMemberships.map((zone) => (
<span
key={zone.id}
className="rounded-full px-3 py-1"
style={{ backgroundColor: `${zone.color}22`, color: zone.color }}
>
{zone.name}
</span>
))}
</div>
</div>
)}

                                <div className="space-y-2 text-xs text-muted-foreground">
                                        <p className="uppercase tracking-wide">Provenance</p>
                                        <div className="flex flex-wrap gap-3">
<span>
Updated {timeAgo(site.updatedAt)} by {site.updatedBy}
</span>
<span>
Coordinates {site.coordinates.lat.toFixed(3)}, {site.coordinates.lng.toFixed(3)}
</span>
</div>
{site.evidenceLinks && site.evidenceLinks.length > 0 && (
                                                <div className="space-y-1">
                                                        <p className="uppercase tracking-wide">Evidence links</p>
                                                        <ul className="space-y-1">
                                                                {site.evidenceLinks.map((link) => (
                                                                        <li key={link}>
                                                                                <a
                                                                                        href={link}
                                                                                        className="text-primary hover:underline"
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                >
                                                                                        {link}
                                                                                </a>
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                </div>
                                        )}
                                </div>

				<div className="space-y-2">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Next actions</p>
					<div className="flex flex-wrap gap-2 text-xs">
						<Button asChild size="sm">
							<Link href={`/research?site=${site.id}`}>Open in Research Hub</Link>
						</Button>
						<Button asChild size="sm" variant="secondary">
							<Link href={`/forum?site=${site.id}`}>Discuss with community</Link>
						</Button>
						{isCommunity && (
							<Button size="sm" variant="ghost">
								Request promotion review
							</Button>
						)}
					</div>
				</div>
			</TabsContent>

                        <TabsContent value="media" className="flex-1 overflow-y-auto space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                                {site.mediaCount > 0
                                                        ? `${site.mediaCount} media assets referenced`
                                                        : "Media gallery will display Supabase storage uploads and embeds."}
                                        </span>
                                        <Button size="sm" variant="ghost" onClick={() => loadMediaTab("media")}>Refresh</Button>
                                </div>
                                <MediaCarousel assets={mediaAssets} loading={loadingTab === "media" || !loadedTabs.media} />
                        </TabsContent>

                        <TabsContent value="documents" className="flex-1 overflow-y-auto space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Attach reports, PDFs, and inline notes to document provenance.</span>
                                        <Button size="sm" variant="ghost" onClick={() => loadMediaTab("documents")}>
                                                Refresh
                                        </Button>
                                </div>
                                <MediaAttachmentList
                                        assets={documentAssets.filter((asset) => asset.type === "document" || asset.type === "text")}
                                        loading={loadingTab === "documents" || !loadedTabs.documents}
                                />
                        </TabsContent>
		</Tabs>
	);

	if (variant === "card") {
		return (
			<Card className={cn("glass-panel flex h-full flex-col overflow-hidden border-border/40", className)}>
				<CardHeader className="border-b border-border/30 pb-4">{header}</CardHeader>
				<CardContent className="flex flex-1 flex-col gap-4 p-4">{tabs}</CardContent>
			</Card>
		);
	}

	return (
		<div className={cn("flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-background/15", className)}>
			<div className="border-b border-border/30 px-4 py-4">{header}</div>
			<div className="flex flex-1 flex-col gap-4 p-4">{tabs}</div>
		</div>
	);
};
