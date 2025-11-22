"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapSite } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ProgressiveDetailDrawerProps {
	site: MapSite | null;
	open: boolean;
	onClose: () => void;
	children?: React.ReactNode;
}

type DrawerState = "closed" | "peek" | "expanded";

const DRAWER_STATES = {
	closed: 0,
	peek: 50, // 50vh
	expanded: 90, // 90vh
};

// Haptic feedback helper
const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
	if (typeof window !== "undefined" && "vibrate" in navigator) {
		const patterns = {
			light: 10,
			medium: 20,
			heavy: 30,
		};
		navigator.vibrate(patterns[type]);
	}
};

export const ProgressiveDetailDrawer = ({ site, open, onClose, children }: ProgressiveDetailDrawerProps) => {
	const [drawerState, setDrawerState] = useState<DrawerState>("closed");
	const [isDragging, setIsDragging] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const controls = useAnimation();

	// When drawer opens, start in peek mode
	useEffect(() => {
		if (open && site) {
			setDrawerState("peek");
			controls.start({
				height: `${DRAWER_STATES.peek}vh`,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			});
			triggerHaptic("light");
		} else {
			setDrawerState("closed");
			controls.start({
				height: 0,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			});
		}
	}, [open, site, controls]);

	// Handle scroll to expand
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			if (drawerState !== "peek") return;

			const scrollTop = e.currentTarget.scrollTop;

			// Expand when user scrolls down past threshold
			if (scrollTop > 30) {
				setDrawerState("expanded");
				controls.start({
					height: `${DRAWER_STATES.expanded}vh`,
					transition: { type: "spring", damping: 30, stiffness: 300 },
				});
				triggerHaptic("light");
			}
		},
		[drawerState, controls]
	);

	const handleClose = useCallback(() => {
		setDrawerState("closed");
		triggerHaptic("medium");
		controls
			.start({
				height: 0,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			})
			.then(() => {
				if (contentRef.current) {
					contentRef.current.scrollTop = 0;
				}
				onClose();
			});
	}, [controls, onClose]);

	// Handle drag gesture on handle
	const handleDragEnd = useCallback(
		(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			setIsDragging(false);
			const { velocity, offset } = info;

			// Fast swipe down = close
			if (velocity.y > 500) {
				handleClose();
				return;
			}

			// Dragged down significantly = close or collapse
			if (offset.y > 100) {
				if (drawerState === "expanded") {
					setDrawerState("peek");
					controls.start({
						height: `${DRAWER_STATES.peek}vh`,
						transition: { type: "spring", damping: 30, stiffness: 300 },
					});
					triggerHaptic("light");
				} else {
					handleClose();
				}
				return;
			}

			// Dragged up = expand
			if (offset.y < -100 && drawerState === "peek") {
				setDrawerState("expanded");
				controls.start({
					height: `${DRAWER_STATES.expanded}vh`,
					transition: { type: "spring", damping: 30, stiffness: 300 },
				});
				triggerHaptic("light");
			}
		},
		[drawerState, controls, handleClose]
	);

	// Handle back button on Android
	useEffect(() => {
		if (!open) return;

		const handlePopState = () => {
			handleClose();
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [open, handleClose]);

	if (!site) return null;

	return (
		<>
			{/* Backdrop */}
			<motion.div
				className={cn("fixed inset-0 z-[450] bg-black/20 backdrop-blur-sm", "md:hidden")}
				initial={{ opacity: 0 }}
				animate={{ opacity: open ? 1 : 0 }}
				transition={{ duration: 0.2 }}
				onClick={handleClose}
				style={{ pointerEvents: open ? "auto" : "none" }}
			/>

			{/* Drawer */}
			<motion.div
				className={cn(
					"fixed bottom-0 left-0 right-0 z-[460]",
					"bg-background/98 backdrop-blur-xl",
					"rounded-t-3xl shadow-2xl",
					"border-t border-l border-r border-border/40",
					"md:hidden",
					isDragging && "cursor-grabbing"
				)}
				initial={{ height: 0 }}
				animate={controls}
				style={{
					touchAction: "none",
				}}
			>
				{/* Drag Handle Area */}
				<motion.div
					className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm rounded-t-3xl"
					drag="y"
					dragConstraints={{ top: 0, bottom: 0 }}
					dragElastic={0.2}
					onDragStart={() => setIsDragging(true)}
					onDragEnd={handleDragEnd}
				>
					{/* Visual drag handle */}
					<div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
						<div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
					</div>

					{/* Header with close button */}
					<div className="flex items-center justify-between px-4 pb-3">
						<div className="flex items-center gap-2">
							<ChevronDown
								className={cn(
									"h-5 w-5 text-muted-foreground transition-transform duration-300",
									drawerState === "expanded" && "rotate-180"
								)}
							/>
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								{drawerState === "peek" ? "Scroll for more" : "Swipe down to collapse"}
							</span>
						</div>
						<Button size="sm" variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</motion.div>

				{/* Scrollable Content */}
				<div ref={contentRef} className="h-full overflow-y-auto overscroll-contain pb-safe" onScroll={handleScroll}>
					<div className="px-4 pb-8">{children}</div>
				</div>

				{/* Scroll indicator - only in peek mode */}
				{drawerState === "peek" && (
					<motion.div
						className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.5, repeat: 3, repeatType: "reverse" }}
					>
						<div className="flex flex-col items-center gap-1 text-muted-foreground">
							<ChevronDown className="h-4 w-4" />
							<span className="text-xs">Scroll for more</span>
						</div>
					</motion.div>
				)}
			</motion.div>
		</>
	);
};

