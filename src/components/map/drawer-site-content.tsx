"use client";

import { useMemo } from "react";
import type { MapSiteFeature } from "@/entities/map/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { MapPin, Calendar, Camera, MessageSquare, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/shared/lib/utils";
import { SiteFollowButton } from "@/features/sites/site-follow-button";

interface DrawerSiteContentProps {
	site: MapSiteFeature;
	allSites?: MapSiteFeature[];
	onSelectSite?: (siteId: string) => void;
	isFollowing?: boolean;
}

const statusVariant: Record<MapSiteFeature["verificationStatus"], "success" | "warning" | "outline"> = {
	verified: "success",
	under_review: "warning",
	unverified: "outline",
};

const communityTierLabel: Record<NonNullable<MapSiteFeature["trustTier"]>, string> = {
	bronze: "Bronze",
	silver: "Silver",
	gold: "Gold",
	promoted: "Promoted",
};

// Distance calculation utility
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth's radius in km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function formatDistance(km: number): string {
	if (km < 1) return `${Math.round(km * 1000)}m`;
	if (km < 10) return `${km.toFixed(1)}km`;
	return `${Math.round(km)}km`;
}

function toRad(deg: number): number {
	return deg * (Math.PI / 180);
}

export const DrawerSiteContent = ({ site, allSites = [], onSelectSite, isFollowing = false }: DrawerSiteContentProps) => {
	const isCommunity = site.layer === "community";
	const tierLabel = site.trustTier ? communityTierLabel[site.trustTier] : undefined;

	// Calculate nearby sites
	const nearbySites = useMemo(() => {
		if (!allSites.length) return [];

		return allSites
			.filter((s) => s.id !== site.id)
			.map((s) => ({
				...s,
				distance: calculateDistance(site.coordinates.lat, site.coordinates.lng, s.coordinates.lat, s.coordinates.lng),
			}))
			.sort((a, b) => a.distance - b.distance)
			.slice(0, 5); // Top 5 nearest
	}, [site, allSites]);

	return (
		<div className="space-y-6">
			{/* Quick Info - Always Visible in Peek Mode */}
			<div className="space-y-3">
				<div>
					<h2 className="text-2xl font-bold leading-tight">{site.name}</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{site.tags.cultures.join(", ") || "Unknown"} • {site.tags.eras.join(", ") || "Unknown"}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant={statusVariant[site.verificationStatus]}>
						{site.verificationStatus === "verified" && "✓ Verified"}
						{site.verificationStatus === "under_review" && "⏳ Under Review"}
						{site.verificationStatus === "unverified" && "Unverified"}
					</Badge>
					<Badge variant={isCommunity ? "outline" : "secondary"}>{isCommunity ? `Community ${tierLabel}` : "Official"}</Badge>
				</div>

				<p className="text-sm text-muted-foreground leading-relaxed">{site.summary}</p>

				{/* Quick Actions */}
				<div className="flex gap-2">
					<Button size="sm" className="flex-1" asChild>
						<Link href={`/content/upload?site=${site.id}`}>
							<Camera className="h-4 w-4 mr-2" />
							Add Photo
						</Link>
					</Button>
					<Button size="sm" variant="outline" className="flex-1" asChild>
						<Link href={`/forum?site=${site.id}`}>
							<MessageSquare className="h-4 w-4 mr-2" />
							Discuss
						</Link>
					</Button>
					<SiteFollowButton
						siteId={site.id}
						initialIsFollowing={isFollowing}
						variant="icon-only"
					/>
				</div>
			</div>

			<Separator />

			{/* Detailed Info - Visible on Expand */}
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
						<div className="min-w-0">
							<p className="font-medium">Location</p>
							<p className="text-xs text-muted-foreground truncate">
								{site.zoneMemberships.length > 0 ? site.zoneMemberships[0].name : "Unknown Region"}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
						<div className="min-w-0">
							<p className="font-medium">Type</p>
							<p className="text-xs text-muted-foreground">{site.siteType}</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<Camera className="h-3 w-3" />
						{site.mediaCount} media
					</span>
					<span className="flex items-center gap-1">
						<Users className="h-3 w-3" />
						{site.relatedResearchIds.length} research
					</span>
					<span>Updated {timeAgo(site.updatedAt)}</span>
				</div>

				{(site.tags.cultures.length > 0 || site.tags.eras.length > 0 || site.tags.themes.length > 0) && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Tags</p>
						<div className="flex flex-wrap gap-2">
							{[...site.tags.cultures, ...site.tags.eras, ...site.tags.themes].map((tag: string) => (
								<span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
									#{tag}
								</span>
							))}
						</div>
					</div>
				)}

				{isCommunity && (
					<div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs">
						<p className="font-semibold text-foreground">Community Contribution</p>
						<p className="mt-1 text-muted-foreground">
							Current tier: {tierLabel}. Help verify this submission by adding supporting evidence or requesting moderator review.
						</p>
					</div>
				)}
			</div>

			<Separator />

			{/* Tabs for More Content */}
			<Tabs defaultValue="nearby" className="w-full">
				<TabsList className="w-full grid grid-cols-3 h-9">
					<TabsTrigger value="nearby" className="text-xs">
						Nearby
						{nearbySites.length > 0 && <span className="ml-1 text-[10px] opacity-60">({nearbySites.length})</span>}
					</TabsTrigger>
					<TabsTrigger value="details" className="text-xs">
						Details
					</TabsTrigger>
					<TabsTrigger value="links" className="text-xs">
						Links
					</TabsTrigger>
				</TabsList>

				<TabsContent value="nearby" className="space-y-3 mt-4">
					{nearbySites.length > 0 ? (
						<>
							<p className="text-xs text-muted-foreground mb-3">Sites near this location</p>
							<div className="space-y-2">
								{nearbySites.map((nearby) => (
									<button
										key={nearby.id}
										onClick={() => onSelectSite?.(nearby.id)}
										className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left border border-border/40"
									>
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<MapPin className="h-4 w-4 text-primary" />
										</div>

										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">{nearby.name}</p>
											<p className="text-xs text-muted-foreground truncate">
												{nearby.tags.cultures[0] || "Unknown"} • {nearby.siteType}
											</p>
										</div>

										<Badge variant="secondary" className="text-xs flex-shrink-0">
											{formatDistance(nearby.distance)}
										</Badge>
									</button>
								))}
							</div>
						</>
					) : (
						<p className="text-sm text-muted-foreground py-4 text-center">No nearby sites found</p>
					)}
				</TabsContent>

				<TabsContent value="details" className="space-y-3 mt-4">
					<div className="space-y-3 text-sm">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Coordinates</p>
							<p className="font-mono text-xs">
								{site.coordinates.lat.toFixed(4)}°, {site.coordinates.lng.toFixed(4)}°
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Last Updated</p>
							<p className="text-xs">
								{timeAgo(site.updatedAt)} by {site.updatedBy}
							</p>
						</div>

						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Zones</p>
							<p className="text-xs">{site.zoneMemberships.length > 0 ? site.zoneMemberships.map((z) => z.name).join(", ") : "No zones"}</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="links" className="space-y-3 mt-4">
					<div className="space-y-2">
						<Button size="sm" variant="outline" className="w-full justify-start" asChild>
							<Link href={`/research?site=${site.id}`}>
								<ExternalLink className="h-4 w-4 mr-2" />
								Open in Research Hub
							</Link>
						</Button>
						<Button size="sm" variant="outline" className="w-full justify-start" asChild>
							<Link href={`/media?site=${site.id}`}>
								<Camera className="h-4 w-4 mr-2" />
								View Media Gallery
							</Link>
						</Button>
						<Button size="sm" variant="outline" className="w-full justify-start" asChild>
							<Link href={`/forum?site=${site.id}`}>
								<MessageSquare className="h-4 w-4 mr-2" />
								Community Discussion
							</Link>
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};
