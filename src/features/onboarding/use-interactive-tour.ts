"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CallBackProps } from "react-joyride";
import { ACTIONS, EVENTS, STATUS } from "react-joyride";
import type * as L from "leaflet";
import {
	TOUR_SITES,
	TOUR_STEPS,
	getSiteForStep,
	stepRequiresFlyTo,
} from "./tour-steps";

interface UseInteractiveTourOptions {
	/** Leaflet map instance for programmatic control */
	mapRef: L.Map | null;
	/** Callback to select a site by ID or coordinates */
	onSelectSite: (siteId: string | null) => void;
	/** Callback when tour completes */
	onComplete: () => void;
	/** Callback when tour is skipped */
	onSkip: () => void;
	/** Available sites to find matches */
	sites?: Array<{ id: string; coordinates: { lat: number; lng: number }; name: string }>;
}

interface UseInteractiveTourReturn {
	/** Whether the tour is currently running */
	run: boolean;
	/** Current step index */
	stepIndex: number;
	/** Joyride steps configuration */
	steps: typeof TOUR_STEPS;
	/** Start the tour */
	startTour: () => void;
	/** Joyride callback handler */
	handleJoyrideCallback: (data: CallBackProps) => void;
}

/**
 * Find the closest site in the database to given coordinates
 * Uses haversine distance approximation
 */
function findClosestSite(
	targetCoords: { lat: number; lng: number },
	sites: Array<{ id: string; coordinates: { lat: number; lng: number }; name: string }>
): string | null {
	if (!sites || sites.length === 0) return null;

	let closestId: string | null = null;
	let closestDistance = Infinity;

	for (const site of sites) {
		const dLat = site.coordinates.lat - targetCoords.lat;
		const dLng = site.coordinates.lng - targetCoords.lng;
		const distance = Math.sqrt(dLat * dLat + dLng * dLng);

		if (distance < closestDistance && distance < 0.5) {
			// Within ~50km
			closestDistance = distance;
			closestId = site.id;
		}
	}

	return closestId;
}

/**
 * Hook to coordinate React Joyride with Leaflet map navigation
 * Handles flying to sites, selecting markers, and advancing steps
 */
export function useInteractiveTour({
	mapRef,
	onSelectSite,
	onComplete,
	onSkip,
	sites = [],
}: UseInteractiveTourOptions): UseInteractiveTourReturn {
	const [run, setRun] = useState(false);
	const [stepIndex, setStepIndex] = useState(0);

	// Track if we're waiting for a map animation to complete
	const isAnimatingRef = useRef(false);

	// Reset state when starting tour
	const startTour = useCallback(() => {
		setStepIndex(0);
		setRun(true);
		onSelectSite(null); // Clear any selected site
	}, [onSelectSite]);

	// Handle flying to a site and waiting for animation
	const flyToSite = useCallback(
		(siteIndex: number, nextStepIndex: number) => {
			const site = TOUR_SITES[siteIndex];
			if (!site || !mapRef) {
				// No map, just advance
				setStepIndex(nextStepIndex);
				return;
			}

			isAnimatingRef.current = true;

			// Fly to the site location
			mapRef.flyTo([site.coordinates.lat, site.coordinates.lng], site.zoom, {
				duration: 1.5,
			});

			// Wait for animation to complete
			const onMoveEnd = () => {
				isAnimatingRef.current = false;

				// Find and select the closest site in our database
				const closestSiteId = findClosestSite(site.coordinates, sites);
				if (closestSiteId) {
					onSelectSite(closestSiteId);
				}

				// Advance to next step after a brief delay for panel to open
				setTimeout(() => {
					setStepIndex(nextStepIndex);
				}, 300);
			};

			mapRef.once("moveend", onMoveEnd);
		},
		[mapRef, sites, onSelectSite]
	);

	// Main Joyride callback handler
	const handleJoyrideCallback = useCallback(
		(data: CallBackProps) => {
			const { action, index, status, type } = data;

			// Handle tour completion
			if (status === STATUS.FINISHED) {
				setRun(false);
				setStepIndex(0);
				onComplete();
				return;
			}

			// Handle skip
			if (status === STATUS.SKIPPED || action === ACTIONS.SKIP) {
				setRun(false);
				setStepIndex(0);
				onSkip();
				return;
			}

			// Handle close button
			if (action === ACTIONS.CLOSE) {
				setRun(false);
				setStepIndex(0);
				onSkip();
				return;
			}

			// Handle step transitions
			if (type === EVENTS.STEP_AFTER) {
				const nextIndex = index + 1;

				// Check if next step requires flying to a site
				if (nextIndex < TOUR_STEPS.length && stepRequiresFlyTo(nextIndex)) {
					const site = getSiteForStep(nextIndex);
					if (site) {
						const siteIndex = TOUR_SITES.findIndex(
							(s) =>
								s.coordinates.lat === site.coordinates.lat &&
								s.coordinates.lng === site.coordinates.lng
						);
						if (siteIndex !== -1) {
							flyToSite(siteIndex, nextIndex);
							return; // Don't advance yet - wait for animation
						}
					}
				}

				// Normal step advance
				if (nextIndex < TOUR_STEPS.length) {
					setStepIndex(nextIndex);
				}
			}

			// Handle going back
			if (type === EVENTS.STEP_BEFORE && action === ACTIONS.PREV) {
				const prevIndex = index - 1;
				if (prevIndex >= 0) {
					// If going back to a site step, fly there
					if (stepRequiresFlyTo(prevIndex)) {
						const site = getSiteForStep(prevIndex);
						if (site) {
							const siteIndex = TOUR_SITES.findIndex(
								(s) =>
									s.coordinates.lat === site.coordinates.lat &&
									s.coordinates.lng === site.coordinates.lng
							);
							if (siteIndex !== -1) {
								flyToSite(siteIndex, prevIndex);
								return;
							}
						}
					}
					setStepIndex(prevIndex);
				}
			}
		},
		[flyToSite, onComplete, onSkip]
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isAnimatingRef.current = false;
		};
	}, []);

	return {
		run,
		stepIndex,
		steps: TOUR_STEPS,
		startTour,
		handleJoyrideCallback,
	};
}

