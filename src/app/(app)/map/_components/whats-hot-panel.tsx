"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, TrendingUp, MapPin, ChevronRight, Sparkles, Image as ImageIcon, MessageSquare } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import type { MapSiteFeature, HeatTier } from "@/entities/map/model/types";

interface WhatsHotPanelProps {
	sites: MapSiteFeature[];
	onFocusSite: (siteId: string) => void;
	className?: string;
}

// Simulated heat data for demo (in production, this comes from API)
function getSimulatedHeatData(sites: MapSiteFeature[]): MapSiteFeature[] {
	// Assign heat tiers based on media count and other factors for demo
	return sites.map((site, index) => {
		let heatTier: HeatTier = "normal";
		let heatScore = 0;
		let trendReason = "";

		// Simulate heat based on position and existing metrics
		if (site.mediaCount >= 30) {
			heatTier = "hot";
			heatScore = 95;
			trendReason = `${site.mediaCount} photos • Expert discussion`;
		} else if (site.mediaCount >= 15) {
			heatTier = "rising";
			heatScore = 85;
			trendReason = `${site.mediaCount} photos • New research`;
		} else if (site.mediaCount >= 5) {
			heatTier = "active";
			heatScore = 70;
			trendReason = "Recent activity";
		} else if (site.verificationStatus === "verified") {
			heatTier = "normal";
			heatScore = 50;
		} else {
			heatTier = index % 5 === 0 ? "normal" : "low";
			heatScore = index % 5 === 0 ? 40 : 20;
		}

		return {
			...site,
			heatTier,
			heatScore,
			trendReason,
		};
	});
}

export function WhatsHotPanel({ sites, onFocusSite, className }: WhatsHotPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Get hot sites with simulated data
	const hotSites = useMemo(() => {
		const sitesWithHeat = getSimulatedHeatData(sites);
		return sitesWithHeat
			.filter((site) => site.heatTier === "hot" || site.heatTier === "rising")
			.sort((a, b) => (b.heatScore ?? 0) - (a.heatScore ?? 0))
			.slice(0, 10);
	}, [sites]);

	const hotCount = hotSites.filter((s) => s.heatTier === "hot").length;
	const risingCount = hotSites.filter((s) => s.heatTier === "rising").length;

	return (
		<>
			{/* Toggle Button */}
			<Button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg",
					isOpen && "ring-2 ring-orange-400/50",
					className
				)}
				size="sm"
			>
				<Flame className="h-4 w-4" />
				<span className="hidden sm:inline">What's Hot</span>
				{hotCount > 0 && (
					<Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1.5">
						{hotCount}
					</Badge>
				)}
			</Button>

			{/* Panel */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden z-50"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-border/30">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
									<Flame className="h-4 w-4 text-white" />
								</div>
								<div>
									<h3 className="font-semibold text-sm">Trending Sites</h3>
									<p className="text-xs text-muted-foreground">
										{hotCount} hot • {risingCount} rising
									</p>
								</div>
							</div>
							<Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsOpen(false)}>
								<X className="h-4 w-4" />
							</Button>
						</div>

						{/* Site List */}
						<ScrollArea className="h-[320px]">
							<div className="p-2 space-y-1">
								{hotSites.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
										<Sparkles className="h-8 w-8 mb-2 opacity-50" />
										<p className="text-sm">No trending sites right now</p>
										<p className="text-xs">Check back soon!</p>
									</div>
								) : (
									hotSites.map((site, index) => (
										<button
											key={site.id}
											onClick={() => {
												onFocusSite(site.id);
												setIsOpen(false);
											}}
											className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
										>
											{/* Rank */}
											<div
												className={cn(
													"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
													site.heatTier === "hot" ? "bg-gradient-to-br from-orange-500 to-red-500 text-white" : "bg-amber-500/20 text-amber-500"
												)}
											>
												{index + 1}
											</div>

											{/* Site Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1.5">
													<p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{site.name}</p>
													{site.heatTier === "hot" && <span className="text-[10px]">🔥</span>}
													{site.heatTier === "rising" && <TrendingUp className="h-3 w-3 text-amber-500" />}
												</div>
												<p className="text-xs text-muted-foreground truncate">{site.trendReason || site.siteType}</p>
											</div>

											{/* Stats */}
											<div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
												{site.mediaCount > 0 && (
													<span className="flex items-center gap-0.5">
														<ImageIcon className="h-3 w-3" />
														{site.mediaCount}
													</span>
												)}
												<ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
											</div>
										</button>
									))
								)}
							</div>
						</ScrollArea>

						{/* Footer */}
						<div className="px-4 py-2.5 border-t border-border/30 bg-muted/30">
							<p className="text-[10px] text-muted-foreground text-center">
								Based on posts, media uploads, and engagement in the last 7 days
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

// Export the heat simulation function for use elsewhere
export { getSimulatedHeatData };

