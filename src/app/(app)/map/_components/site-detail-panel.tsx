"use client";

import type { MapSite } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn, timeAgo } from "@/lib/utils";
import Link from "next/link";

interface SiteDetailPanelProps {
	site: MapSite | null;
	className?: string;
	variant?: "card" | "flat";
}

const statusVariant: Record<MapSite["verificationStatus"], "success" | "warning" | "outline"> = {
	verified: "success",
	under_review: "warning",
	unverified: "outline",
};

const communityTierLabel: Record<NonNullable<MapSite["trustTier"]>, string> = {
	bronze: "Community Bronze",
	silver: "Community Silver",
	gold: "Community Gold",
	promoted: "Promoted to Official",
};

export const SiteDetailPanel = ({ site, className, variant = "card" }: SiteDetailPanelProps) => {
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
					{site.civilization} - {site.era}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
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
		<Tabs defaultValue="overview" className="flex h-full flex-col gap-4">
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
				<TabsTrigger value="discussion" className="shrink-0 px-3 py-1">
					Discussion
				</TabsTrigger>
				<TabsTrigger value="activity" className="shrink-0 px-3 py-1">
					Activity
				</TabsTrigger>
			</TabsList>

			<TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 text-sm text-muted-foreground">
				<p>{site.summary}</p>

				<div className="flex flex-wrap gap-2 text-xs">
					<span className="rounded-full bg-secondary/40 px-3 py-1">{site.siteType}</span>
					<span className="rounded-full bg-secondary/40 px-3 py-1">{site.mediaCount} media assets</span>
					<span className="rounded-full bg-secondary/40 px-3 py-1">{site.relatedResearchIds.length} research links</span>
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
						{site.tags.map((tag) => (
							<span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
								#{tag}
							</span>
						))}
					</div>
				</div>

				<div className="space-y-2 text-xs text-muted-foreground">
					<p className="uppercase tracking-wide">Provenance</p>
					<div className="flex flex-wrap gap-3">
						<span>
							Updated {timeAgo(site.lastUpdated)} by {site.updatedBy}
						</span>
						<span>
							Coordinates {site.latitude.toFixed(3)}, {site.longitude.toFixed(3)}
						</span>
					</div>
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
				<p>
					{site.mediaCount > 0
						? `Media gallery placeholder - ${site.mediaCount} assets staged for integration.`
						: "No media have been linked yet. Add photos or videos to strengthen this entry."}
				</p>
				<Button size="sm" variant="ghost">
					Upload media
				</Button>
			</TabsContent>

			<TabsContent value="documents" className="flex-1 overflow-y-auto space-y-3 text-sm text-muted-foreground">
				<p>Document library integration coming soon. Attach field notes, PDFs, or external research references to provide supporting evidence.</p>
				<Button size="sm" variant="ghost">
					Attach document
				</Button>
			</TabsContent>

			<TabsContent value="discussion" className="flex-1 overflow-y-auto space-y-3 text-sm text-muted-foreground">
				<p>
					Join the conversation with researchers and community members exploring this entry. Deep-link to active threads or start a new discussion.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button asChild size="sm">
						<Link href={`/forum?site=${site.id}`}>View discussions</Link>
					</Button>
					<Button size="sm" variant="ghost">
						Start a thread
					</Button>
				</div>
			</TabsContent>

			<TabsContent value="activity" className="flex-1 overflow-y-auto space-y-3 text-sm text-muted-foreground">
				<p>Recent activity timeline will surface edits, promotions, and moderator reviews.</p>
				<Separator className="border-border/40" />
				<ul className="space-y-2 text-xs">
					<li>
						<span className="font-semibold text-foreground">Last updated:</span> {timeAgo(site.lastUpdated)} by {site.updatedBy}
					</li>
					{isCommunity && tierLabel && (
						<li>
							<span className="font-semibold text-foreground">Current tier:</span> {tierLabel}
						</li>
					)}
					<li>
						<span className="font-semibold text-foreground">Research links:</span> {site.relatedResearchIds.length}
					</li>
				</ul>
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
