"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Custom Mobile Drawer Component
 *
 * A reliable bottom drawer implementation that solves common issues with libraries like vaul:
 * - Works with modal={false} (keeps background interactive)
 * - Properly handles scrollable content inside the drawer
 * - Snap points work reliably across all viewport sizes
 * - Touch-friendly drag gestures
 *
 * @example Basic usage
 * ```tsx
 * import { MobileDrawer, DRAWER_SNAP_POINTS } from "@/shared/ui/mobile-drawer";
 *
 * function MyComponent() {
 *   const [snap, setSnap] = useState(DRAWER_SNAP_POINTS.PEEK);
 *
 *   return (
 *     <MobileDrawer
 *       snap={snap}
 *       onSnapChange={setSnap}
 *       header={<div className="p-4">Header Content</div>}
 *     >
 *       <div className="p-4">Scrollable content here...</div>
 *     </MobileDrawer>
 *   );
 * }
 * ```
 *
 * @example Custom snap points
 * ```tsx
 * const customSnaps = { PEEK: 20, HALF: 50, FULL: 90 };
 *
 * <MobileDrawer
 *   snapPoints={customSnaps}
 *   snap={customSnaps.PEEK}
 *   onSnapChange={setSnap}
 *   header={<Header />}
 * >
 *   <Content />
 * </MobileDrawer>
 * ```
 */

// Default snap points as percentages of viewport height
export const DRAWER_SNAP_POINTS = {
	PEEK: 38, // 38% - shows header + 1-2 content items
	HALF: 55, // 55% - half screen
	FULL: 92, // 92% - nearly full screen (leaving room for status bar)
} as const;

export type DrawerSnapPoint = number;

export interface DrawerSnapPoints {
	PEEK: number;
	HALF: number;
	FULL: number;
}

export interface MobileDrawerProps {
	/** Content to render inside the drawer (scrollable area) */
	children: React.ReactNode;
	/** Header content rendered in the drag handle area (not scrollable) */
	header?: React.ReactNode;
	/** Custom snap points configuration */
	snapPoints?: DrawerSnapPoints;
	/** Controlled snap point value (percentage of viewport height) */
	snap?: DrawerSnapPoint;
	/** Initial snap if not controlled */
	initialSnap?: DrawerSnapPoint;
	/** Callback when snap point changes */
	onSnapChange?: (snap: DrawerSnapPoint) => void;
	/** Additional CSS classes for the drawer container */
	className?: string;
	/** Additional CSS classes for the content area */
	contentClassName?: string;
	/** Whether to show the visual drag indicator bar */
	showDragIndicator?: boolean;
	/** Z-index for the drawer */
	zIndex?: number;
	/** Background color class (defaults to bg-card) */
	bgClassName?: string;
	/** Border radius class (defaults to rounded-t-[20px]) */
	radiusClassName?: string;
}

export function MobileDrawer({
	children,
	header,
	snapPoints = DRAWER_SNAP_POINTS,
	snap: controlledSnap,
	initialSnap,
	onSnapChange,
	className,
	contentClassName,
	showDragIndicator = true,
	zIndex = 1201,
	bgClassName = "bg-card",
	radiusClassName = "rounded-t-[20px]",
}: MobileDrawerProps) {
	const defaultSnap = initialSnap ?? snapPoints.PEEK;
	const [internalSnap, setInternalSnap] = useState<DrawerSnapPoint>(defaultSnap);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);

	const drawerRef = useRef<HTMLDivElement>(null);
	const dragStartY = useRef(0);
	const dragStartSnap = useRef(defaultSnap);
	const contentRef = useRef<HTMLDivElement>(null);
	const isScrolling = useRef(false);

	// Use controlled snap if provided, otherwise internal
	const currentSnap = controlledSnap ?? internalSnap;

	// Sync internal state when controlled snap changes
	useEffect(() => {
		if (controlledSnap !== undefined) {
			setInternalSnap(controlledSnap);
		}
	}, [controlledSnap]);

	// Get the actual height in pixels for a snap point
	const getSnapHeight = useCallback((snap: DrawerSnapPoint) => {
		if (typeof window === "undefined") return 0;
		return (snap / 100) * window.innerHeight;
	}, []);

	// Find nearest snap point based on current position
	const findNearestSnap = useCallback(
		(currentHeight: number): DrawerSnapPoint => {
			const viewportHeight = window.innerHeight;
			const currentPercent = (currentHeight / viewportHeight) * 100;

			const snaps = [snapPoints.PEEK, snapPoints.HALF, snapPoints.FULL];
			let nearest = snaps[0];
			let minDist = Math.abs(currentPercent - snaps[0]);

			for (const snap of snaps) {
				const dist = Math.abs(currentPercent - snap);
				if (dist < minDist) {
					minDist = dist;
					nearest = snap;
				}
			}

			return nearest;
		},
		[snapPoints]
	);

	// Handle drag start
	const handleDragStart = useCallback(
		(clientY: number) => {
			// Check if we're scrolling inside content
			if (contentRef.current) {
				const scrollTop = contentRef.current.scrollTop;
				// Only allow drag from handle or when content is scrolled to top
				if (scrollTop > 0) {
					isScrolling.current = true;
					return;
				}
			}

			isScrolling.current = false;
			setIsDragging(true);
			dragStartY.current = clientY;
			dragStartSnap.current = currentSnap;
		},
		[currentSnap]
	);

	// Handle drag move
	const handleDragMove = useCallback(
		(clientY: number) => {
			if (!isDragging || isScrolling.current) return;

			const deltaY = dragStartY.current - clientY;
			setDragOffset(deltaY);
		},
		[isDragging]
	);

	// Handle drag end
	const handleDragEnd = useCallback(() => {
		if (!isDragging) return;

		setIsDragging(false);

		const currentHeight = getSnapHeight(dragStartSnap.current) + dragOffset;
		const newSnap = findNearestSnap(currentHeight);

		setInternalSnap(newSnap);
		setDragOffset(0);
		onSnapChange?.(newSnap);
	}, [isDragging, dragOffset, getSnapHeight, findNearestSnap, onSnapChange]);

	// Touch event handlers
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			handleDragStart(e.touches[0].clientY);
		},
		[handleDragStart]
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			handleDragMove(e.touches[0].clientY);
		},
		[handleDragMove]
	);

	const handleTouchEnd = useCallback(() => {
		handleDragEnd();
	}, [handleDragEnd]);

	// Mouse event handlers (for desktop/devtools testing)
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			handleDragStart(e.clientY);
		},
		[handleDragStart]
	);

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			handleDragMove(e.clientY);
		};

		const handleMouseUp = () => {
			handleDragEnd();
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleDragMove, handleDragEnd]);

	// Calculate current visual height
	const visualHeight = isDragging ? getSnapHeight(dragStartSnap.current) + dragOffset : getSnapHeight(currentSnap);

	// Minimum height is the PEEK snap
	const minHeight = getSnapHeight(snapPoints.PEEK);

	return (
		<div
			ref={drawerRef}
			className={cn(
				"fixed inset-x-0 bottom-0 flex flex-col shadow-lg border-t border-border/50",
				bgClassName,
				radiusClassName,
				!isDragging && "transition-[height] duration-300 ease-out",
				className
			)}
			style={{
				zIndex,
				height: `${Math.max(visualHeight, minHeight)}px`,
				maxHeight: `${snapPoints.FULL}dvh`,
			}}
		>
			{/* Drag handle area */}
			<div
				className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleMouseDown}
			>
				{/* Visual drag indicator */}
				{showDragIndicator && (
					<div className="flex justify-center py-3">
						<div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
					</div>
				)}

				{/* Header content */}
				{header}
			</div>

			{/* Scrollable content area */}
			<div
				ref={contentRef}
				className={cn("flex-1 min-h-0 overflow-y-auto overscroll-contain", contentClassName)}
				onTouchStart={(e) => {
					// Allow scrolling inside content without triggering drawer drag
					if (contentRef.current && contentRef.current.scrollTop > 0) {
						e.stopPropagation();
					}
				}}
			>
				{children}
			</div>
		</div>
	);
}

// Helper hook for common drawer patterns
export function useMobileDrawer(initialSnap?: DrawerSnapPoint) {
	const [snap, setSnap] = useState<DrawerSnapPoint>(initialSnap ?? DRAWER_SNAP_POINTS.PEEK);

	const open = useCallback(() => {
		setSnap(DRAWER_SNAP_POINTS.HALF);
	}, []);

	const close = useCallback(() => {
		setSnap(DRAWER_SNAP_POINTS.PEEK);
	}, []);

	const expand = useCallback(() => {
		setSnap(DRAWER_SNAP_POINTS.FULL);
	}, []);

	const toggle = useCallback(() => {
		setSnap((current) => (current === DRAWER_SNAP_POINTS.PEEK ? DRAWER_SNAP_POINTS.HALF : DRAWER_SNAP_POINTS.PEEK));
	}, []);

	return {
		snap,
		setSnap,
		open,
		close,
		expand,
		toggle,
		isOpen: snap !== DRAWER_SNAP_POINTS.PEEK,
		isExpanded: snap === DRAWER_SNAP_POINTS.FULL,
	};
}
