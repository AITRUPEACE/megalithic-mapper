"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import { useInteractiveTour } from "./use-interactive-tour";

interface MapTourProps {
	/** Leaflet map instance */
	mapRef: L.Map | null;
	/** Callback to select a site */
	onSelectSite: (siteId: string | null) => void;
	/** Callback when tour completes */
	onComplete: () => void;
	/** Callback when tour is skipped */
	onSkip: () => void;
	/** Available sites for matching */
	sites?: Array<{ id: string; coordinates: { lat: number; lng: number }; name: string }>;
	/** Whether to auto-start the tour */
	autoStart?: boolean;
}

/**
 * Interactive map tour component using React Joyride
 * Coordinates with the Leaflet map to fly to sites and show details
 */
export function MapTour({ mapRef, onSelectSite, onComplete, onSkip, sites = [], autoStart = false }: MapTourProps) {
	const [Joyride, setJoyride] = useState<React.ComponentType<any> | null>(null);

	const { run, stepIndex, steps, startTour, handleJoyrideCallback } = useInteractiveTour({
		mapRef,
		onSelectSite,
		onComplete,
		onSkip,
		sites,
	});

	// Track if we've auto-started to prevent double-start
	const hasAutoStarted = useRef(false);

	// Load Joyride dynamically on client side
	useEffect(() => {
		console.log("[MapTour] Loading Joyride...");
		import("react-joyride").then((mod) => {
			console.log("[MapTour] Joyride loaded!", mod.default);
			setJoyride(() => mod.default);
		});
	}, []);

	// Auto-start if requested (after Joyride is loaded)
	useEffect(() => {
		console.log("[MapTour] autoStart check:", { autoStart, joyrideLoaded: !!Joyride, hasAutoStarted: hasAutoStarted.current });
		if (autoStart && Joyride && !hasAutoStarted.current) {
			hasAutoStarted.current = true;
			console.log("[MapTour] Starting tour in 300ms...");
			const timer = setTimeout(() => {
				console.log("[MapTour] Calling startTour now");
				startTour();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [autoStart, startTour, Joyride]);

	console.log("[MapTour] Render state:", { joyrideLoaded: !!Joyride, run, stepIndex });

	// Don't render until Joyride is loaded
	if (!Joyride) {
		console.log("[MapTour] Joyride not loaded yet, returning null");
		return null;
	}

	return (
		<Joyride
			steps={steps}
			run={run}
			stepIndex={stepIndex}
			continuous
			showProgress
			showSkipButton
			scrollToFirstStep={false}
			disableScrolling
			disableOverlayClose
			spotlightClicks
			callback={handleJoyrideCallback}
			locale={{
				back: "Back",
				close: "Close",
				last: "Finish",
				next: "Next",
				skip: "Skip Tour",
			}}
			styles={{
				options: {
					backgroundColor: "#1a1f26",
					textColor: "#e2e8f0",
					primaryColor: "#6366f1",
					overlayColor: "rgba(0, 0, 0, 0.75)",
					arrowColor: "#1a1f26",
					zIndex: 10000,
				},
				tooltip: {
					borderRadius: 12,
					padding: "20px 24px",
				},
				tooltipContainer: {
					textAlign: "left",
				},
				tooltipTitle: {
					fontSize: 18,
					fontWeight: 600,
					marginBottom: 8,
				},
				tooltipContent: {
					fontSize: 14,
					lineHeight: 1.6,
				},
				buttonNext: {
					backgroundColor: "#6366f1",
					borderRadius: 8,
					color: "#fff",
					fontSize: 14,
					fontWeight: 500,
					padding: "10px 20px",
				},
				buttonBack: {
					color: "#94a3b8",
					fontSize: 14,
					marginRight: 8,
				},
				buttonSkip: {
					color: "#64748b",
					fontSize: 13,
				},
				buttonClose: {
					color: "#94a3b8",
				},
				spotlight: {
					borderRadius: 8,
				},
				overlay: {
					mixBlendMode: undefined as unknown as "normal", // Type workaround
				},
			}}
			floaterProps={{
				disableAnimation: false,
				styles: {
					floater: {
						filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))",
					},
				},
			}}
		/>
	);
}

// Export a hook to trigger the tour from elsewhere
export { useInteractiveTour };
