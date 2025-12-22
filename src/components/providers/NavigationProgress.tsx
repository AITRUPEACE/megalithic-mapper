"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";

/**
 * A thin progress bar at the top of the viewport that shows during page navigations.
 * Similar to YouTube/GitHub loading indicators.
 */
export function NavigationProgress() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const startLoading = useCallback(() => {
		setIsLoading(true);
		setProgress(0);

		// Simulate progress
		intervalRef.current = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 90) {
					return prev;
				}
				// Slow down as we approach 90%
				const increment = Math.max(1, (90 - prev) / 10);
				return Math.min(90, prev + increment);
			});
		}, 100);
	}, []);

	const completeLoading = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		setProgress(100);

		// Hide after animation completes
		timeoutRef.current = setTimeout(() => {
			setIsLoading(false);
			setProgress(0);
		}, 200);
	}, []);

	// Track route changes
	useEffect(() => {
		// Complete any existing loading when route changes
		completeLoading();
	}, [pathname, searchParams, completeLoading]);

	// Listen for navigation start events via click handlers
	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const anchor = target.closest("a");

			if (!anchor) return;

			const href = anchor.getAttribute("href");
			if (!href) return;

			// Skip external links, hash links, and same-page links
			if (
				href.startsWith("http") ||
				href.startsWith("#") ||
				href.startsWith("mailto:") ||
				href.startsWith("tel:") ||
				anchor.target === "_blank"
			) {
				return;
			}

			// Check if it's a different route
			const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
			if (href !== currentPath && href !== pathname) {
				startLoading();
			}
		};

		document.addEventListener("click", handleClick, true);
		return () => document.removeEventListener("click", handleClick, true);
	}, [pathname, searchParams, startLoading]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	if (!isLoading && progress === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent",
				"pointer-events-none"
			)}
		>
			<div
				className={cn(
					"h-full bg-primary transition-all duration-200 ease-out",
					progress === 100 && "opacity-0"
				)}
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}


