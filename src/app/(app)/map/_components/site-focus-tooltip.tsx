"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import type { MapSiteFeature } from "@/entities/map/model/types";
import { getSiteTypeIcon } from "@/components/map/site-type-icons";
import { Badge } from "@/shared/ui/badge";
import { MapPin } from "lucide-react";

interface SiteFocusTooltipProps {
	/** The site to display in the tooltip, or null to hide */
	site: MapSiteFeature | null;
	/** Screen position of the marker { x, y } in pixels */
	markerPosition: { x: number; y: number } | null;
	/** Called when user taps the tooltip to select the site */
	onSelect?: (siteId: string) => void;
	/** Additional className */
	className?: string;
}

/** Offset above the marker where tooltip appears */
const TOOLTIP_OFFSET_Y = 60;

/**
 * Floating tooltip that appears when a map marker is near the screen's focus point.
 *
 * Displays compact site information and allows tapping to select the site.
 * The tooltip appears above the marker with a connector line pointing to it.
 */
export function SiteFocusTooltip({ site, markerPosition, onSelect, className }: SiteFocusTooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const lastSiteIdRef = useRef<string | null>(null);

	// Handle visibility transitions
	useEffect(() => {
		if (site && markerPosition) {
			// Show immediately if same site, or after brief delay for new site
			if (lastSiteIdRef.current === site.id) {
				setIsVisible(true);
			} else {
				const timer = setTimeout(() => setIsVisible(true), 50);
				lastSiteIdRef.current = site.id;
				return () => clearTimeout(timer);
			}
		} else {
			setIsVisible(false);
			lastSiteIdRef.current = null;
		}
	}, [site, markerPosition]);

	// Don't render if no site or position
	if (!site || !markerPosition) return null;

	const SiteIcon = getSiteTypeIcon(site.siteType);
	const isVerified = site.verificationStatus === "verified";

	// Position tooltip above the marker
	const tooltipTop = Math.max(70, markerPosition.y - TOOLTIP_OFFSET_Y);

	return (
		<div
			className={cn(
				"fixed pointer-events-none flex flex-col items-center",
				zClass.tooltip,
				"transition-opacity duration-100",
				isVisible ? "opacity-100" : "opacity-0",
				className
			)}
			style={{
				left: markerPosition.x,
				top: tooltipTop,
				transform: "translateX(-50%)",
			}}
		>
			{/* Tooltip card */}
			<button
				onClick={() => onSelect?.(site.id)}
				className={cn(
					"pointer-events-auto",
					"flex items-center gap-3 px-3 py-2.5",
					"bg-card/95 backdrop-blur-sm",
					"border border-border/50 rounded-xl",
					"shadow-lg shadow-black/20",
					"transition-transform duration-150 active:scale-95",
					"max-w-[280px]"
				)}
			>
				{/* Site type icon */}
				<div
					className={cn(
						"shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
						isVerified ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
					)}
				>
					<SiteIcon size={20} />
				</div>

				{/* Site info */}
				<div className="flex-1 min-w-0 text-left">
					<div className="flex items-center gap-1.5">
						<span className="font-semibold text-sm truncate">{site.name}</span>
						{isVerified && (
							<Badge variant="default" className="h-4 px-1 text-[9px] font-bold shrink-0">
								✓
							</Badge>
						)}
					</div>
					<p className="text-xs text-muted-foreground truncate capitalize">{site.siteType.replace(/_/g, " ")}</p>
				</div>

				{/* Visual indicator */}
				<div className="shrink-0 text-muted-foreground/60">
					<MapPin className="h-4 w-4" />
				</div>
			</button>

			{/* Connector line pointing down to marker */}
			<div className="w-0.5 h-4 rounded-full bg-gradient-to-b from-primary/60 to-transparent" />
		</div>
	);
}

/**
 * Visual indicator showing the focus point on the map.
 * This is the crosshair/reticle that shows where the proximity detection occurs.
 */
export function FocusPointIndicator({ focusY, isActive, className }: { focusY: number; isActive: boolean; className?: string }) {
	return (
		<div
			className={cn(
				"fixed left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300",
				zClass.mapControls,
				isActive ? "opacity-0" : "opacity-40",
				className
			)}
			style={{ top: focusY - 16 }}
		>
			<div className="relative w-8 h-8">
				{/* Outer ring */}
				<div className="absolute inset-0 rounded-full border-2 border-foreground/20" />
				{/* Center dot */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-1 h-1 rounded-full bg-foreground/40" />
				</div>
				{/* Crosshair lines */}
				<div className="absolute top-1/2 left-0 w-2 h-0.5 -translate-y-1/2 bg-foreground/20" />
				<div className="absolute top-1/2 right-0 w-2 h-0.5 -translate-y-1/2 bg-foreground/20" />
				<div className="absolute left-1/2 top-0 w-0.5 h-2 -translate-x-1/2 bg-foreground/20" />
				<div className="absolute left-1/2 bottom-0 w-0.5 h-2 -translate-x-1/2 bg-foreground/20" />
			</div>
		</div>
	);
}
