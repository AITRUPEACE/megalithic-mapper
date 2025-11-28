"use client";

import type { MapSiteFeature } from "@/entities/map/model/types";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { cn, timeAgo } from "@/shared/lib/utils";

interface SiteListProps {
	sites: MapSiteFeature[];
	selectedSiteId: string | null;
	onSelect: (siteId: string) => void;
	className?: string;
	scrollClassName?: string;
	variant?: "card" | "flat";
}

const verificationLabel: Record<MapSiteFeature["verificationStatus"], string> = {
	verified: "Verified",
	under_review: "Under review",
	unverified: "Unverified",
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

export const SiteList = ({ sites, selectedSiteId, onSelect, className, scrollClassName, variant = "card" }: SiteListProps) => {
	if (!sites.length) {
		const emptyClasses =
			variant === "card"
				? "glass-panel border-border/40 p-6 text-sm text-muted-foreground"
				: "flex h-full flex-col justify-center rounded-xl border border-border/40 bg-background/15 p-6 text-sm text-muted-foreground";
		return (
			<div className={cn(emptyClasses, className)}>No sites match the current filters. Try widening your civilization or verification criteria.</div>
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
											<Badge variant="outline">{categoryLabel[site.category]}</Badge>
											<Badge variant={site.verificationStatus === "verified" ? "success" : "outline"}>
												{verificationLabel[site.verificationStatus]}
											</Badge>
											<Badge variant={isCommunity ? "outline" : "secondary"}>{isCommunity ? tierLabel ?? "Community" : "Official"}</Badge>
										</div>
									</div>
									<p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
										{(site.tags.cultures[0] ?? "Unattributed culture").toUpperCase()} - {(site.tags.eras[0] ?? "Unknown era").toUpperCase()}
									</p>
									{site.zoneMemberships.length > 0 && <p className="mt-1 text-xs font-semibold text-primary">📍 {site.zoneMemberships[0].name}</p>}
									<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{site.summary}</p>
									{site.zoneMemberships.length > 1 && (
										<p className="mt-2 text-xs text-muted-foreground">
											Also in:{" "}
											{site.zoneMemberships
												.slice(1)
												.map((zone) => zone.name)
												.join(", ")}
										</p>
									)}
									<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										{site.tags.themes.slice(0, 3).map((tag) => (
											<span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
												#{tag}
											</span>
										))}
										<span className="rounded-full bg-secondary/40 px-2 py-1">{site.siteType}</span>
										<span>Updated {timeAgo(site.updatedAt)}</span>
										{site.relatedResearchIds.length > 0 && (
											<span className="rounded-full bg-primary/15 px-2 py-1 text-primary text-[11px] uppercase tracking-wide">Research linked</span>
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
