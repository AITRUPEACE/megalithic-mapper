"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, MapPin, MessageSquare, Image, FileText, Heart, Camera, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn, timeAgo } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { MapSiteFeature } from "@/entities/map/model/types";
import Link from "next/link";
import NextImage from "next/image";
import { DrawerComments } from "@/components/discussion/drawer-comments";

// Mock media data - in production this would come from the API
interface SiteMedia {
	id: string;
	url: string;
	thumbnail: string;
	title: string;
	likes: number;
	comments: number;
	uploadedBy: string;
	uploadedAt: string;
}

// Generate mock media based on site - in production, fetch from API
function getMockMediaForSite(siteId: string, count: number): SiteMedia[] {
	// Use deterministic "random" based on site ID for consistent mock data
	const hash = siteId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

	const mockImages = [
		"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
		"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
	];

	return Array.from({ length: Math.min(count, 6) }, (_, i) => ({
		id: `media-${siteId}-${i}`,
		url: mockImages[(hash + i) % mockImages.length],
		thumbnail: mockImages[(hash + i) % mockImages.length],
		title: `Photo ${i + 1}`,
		likes: Math.floor(((hash * (i + 1)) % 100) + 5),
		comments: Math.floor(((hash * (i + 2)) % 20) + 1),
		uploadedBy: ["dr.aminah.s", "explorer.maya", "arch.santillan", "citizen.larisa"][(hash + i) % 4],
		uploadedAt: new Date(Date.now() - (hash + i) * 86400000).toISOString(),
	}));
}

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
	const [activeTab, setActiveTab] = useState("overview");

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

	// Reset tab when site changes
	useEffect(() => {
		setActiveTab("overview");
	}, [site?.id]);

	const isCommunity = site?.layer === "community";
	const tierLabel = site?.trustTier ? communityTierLabel[site.trustTier] : undefined;

	// Get mock media for preview
	const siteMedia = site ? getMockMediaForSite(site.id, site.mediaCount) : [];
	const previewMedia = siteMedia.slice(0, 4); // Show up to 4 in preview

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
						className={cn("fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden", zClass.modalBackdrop)}
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
							"fixed right-0 top-0 h-full w-full max-w-md border-l border-border/40 bg-card shadow-2xl",
							zClass.modal,
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
									<Badge variant={isCommunity ? "outline" : "secondary"}>{isCommunity ? tierLabel ?? "Community" : "Official"}</Badge>
								</div>
							</div>
							<Button size="icon" variant="ghost" className="shrink-0" onClick={onClose}>
								<X className="h-5 w-5" />
							</Button>
						</div>

						{/* Content */}
						<ScrollArea className="h-[calc(100%-140px)]">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
								<TabsList className="w-full justify-start gap-1 bg-muted/30 p-1">
									<TabsTrigger value="overview" className="text-xs">
										Overview
									</TabsTrigger>
									<TabsTrigger value="media" className="text-xs">
										<Image className="h-3 w-3 mr-1" />
										Media
										{site.mediaCount > 0 && <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-[10px]">{site.mediaCount}</span>}
									</TabsTrigger>
									<TabsTrigger value="discussion" className="text-xs">
										<MessageSquare className="h-3 w-3 mr-1" />
										Discussion
									</TabsTrigger>
								</TabsList>

								<TabsContent value="overview" className="mt-4 space-y-4">
									{/* Summary */}
									<p className="text-sm text-muted-foreground leading-relaxed">{site.summary}</p>

									{/* Photo Grid Preview - Desktop only */}
									{previewMedia.length > 0 && (
										<div className="hidden sm:block space-y-2">
											<div className="flex items-center justify-between">
												<p className="text-xs uppercase tracking-wide text-muted-foreground">
													<Camera className="inline h-3 w-3 mr-1" />
													Photos
												</p>
												{site.mediaCount > 4 && (
													<button onClick={() => setActiveTab("media")} className="text-xs text-primary hover:underline flex items-center gap-1">
														Show all {site.mediaCount}
														<span aria-hidden>→</span>
													</button>
												)}
											</div>
											<div className="grid grid-cols-2 gap-2">
												{previewMedia.map((media, index) => (
													<button
														key={media.id}
														onClick={() => setActiveTab("media")}
														className={cn(
															"group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted",
															"ring-offset-background transition-all",
															"hover:ring-2 hover:ring-primary hover:ring-offset-2",
															"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
														)}
													>
														<NextImage
															src={media.thumbnail}
															alt={media.title}
															fill
															className="object-cover transition-transform group-hover:scale-105"
															sizes="(max-width: 768px) 50vw, 200px"
														/>
														{/* Overlay with engagement stats */}
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
														<div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
															<div className="flex items-center gap-2 text-white text-xs">
																<span className="flex items-center gap-0.5">
																	<Heart className="h-3 w-3 fill-current" />
																	{media.likes}
																</span>
																<span className="flex items-center gap-0.5">
																	<MessageSquare className="h-3 w-3" />
																	{media.comments}
																</span>
															</div>
														</div>
														{/* Always visible engagement bubbles */}
														<div className="absolute top-1.5 right-1.5 flex items-center gap-1">
															<span className="flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
																<Heart className="h-2.5 w-2.5 fill-red-400 text-red-400" />
																{media.likes}
															</span>
														</div>
														{/* Show +N overlay on last image if there are more */}
														{index === 3 && site.mediaCount > 4 && (
															<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
																<span className="text-white font-semibold text-lg">+{site.mediaCount - 4}</span>
															</div>
														)}
													</button>
												))}
											</div>
										</div>
									)}

									{/* Quick stats */}
									<div className="grid grid-cols-3 gap-2">
										<button
											onClick={() => setActiveTab("media")}
											className="rounded-lg bg-muted/30 p-3 text-center hover:bg-muted/50 transition-colors"
										>
											<p className="text-lg font-semibold">{site.mediaCount}</p>
											<p className="text-xs text-muted-foreground">Media</p>
										</button>
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
									{siteMedia.length > 0 ? (
										<div className="space-y-4">
											{/* Media grid */}
											<div className="grid grid-cols-2 gap-2">
												{siteMedia.map((media) => (
													<div key={media.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted cursor-pointer">
														<NextImage
															src={media.thumbnail}
															alt={media.title}
															fill
															className="object-cover transition-transform group-hover:scale-105"
															sizes="(max-width: 768px) 50vw, 200px"
														/>
														{/* Engagement overlay */}
														<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
														<div className="absolute bottom-0 left-0 right-0 p-2">
															<div className="flex items-center justify-between text-white text-xs">
																<span className="truncate text-[11px]">@{media.uploadedBy}</span>
																<div className="flex items-center gap-2">
																	<span className="flex items-center gap-0.5">
																		<Heart className="h-3 w-3 fill-red-400 text-red-400" />
																		{media.likes}
																	</span>
																	<span className="flex items-center gap-0.5">
																		<MessageSquare className="h-3 w-3" />
																		{media.comments}
																	</span>
																</div>
															</div>
														</div>
													</div>
												))}
											</div>

											{/* Upload button */}
											<Button variant="outline" size="sm" className="w-full">
												<Camera className="h-4 w-4 mr-2" />
												Upload Media
											</Button>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-12 text-center">
											<Image className="h-12 w-12 text-muted-foreground/50 mb-4" />
											<p className="text-sm text-muted-foreground">No media uploaded yet</p>
											<p className="text-xs text-muted-foreground mt-1">Be the first to contribute photos!</p>
											<Button variant="outline" size="sm" className="mt-4">
												<Camera className="h-4 w-4 mr-2" />
												Upload Media
											</Button>
										</div>
									)}
								</TabsContent>

								<TabsContent value="discussion" className="mt-4">
									<DrawerComments siteId={site.id} />
								</TabsContent>
							</Tabs>
						</ScrollArea>

						{/* Footer actions */}
						<div className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-card p-4">
							<div className="flex gap-2">
								<Button asChild className="flex-1">
									<Link href={`/sites/${site.id}`}>
										<ExternalLink className="h-4 w-4 mr-2" />
										View Full Details
									</Link>
								</Button>
								<Button variant="outline" asChild className="flex-1">
									<Link href={`/contribute?site=${site.id}`}>
										<Plus className="h-4 w-4 mr-2" />
										Contribute
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
