import type { Step } from "react-joyride";

/**
 * Tour site definition - coordinates for featured archaeological sites
 */
export interface TourSite {
	id?: string; // DB site ID if exists (will be looked up dynamically)
	name: string;
	coordinates: { lat: number; lng: number };
	zoom: number;
}

/**
 * Featured sites for the interactive tour
 * These are iconic sites that most users will recognize
 */
export const TOUR_SITES: TourSite[] = [
	{
		name: "Great Pyramid of Giza",
		coordinates: { lat: 29.9792, lng: 31.1342 },
		zoom: 14,
	},
	{
		name: "Stonehenge",
		coordinates: { lat: 51.1789, lng: -1.8262 },
		zoom: 15,
	},
	{
		name: "Machu Picchu",
		coordinates: { lat: -13.1631, lng: -72.545 },
		zoom: 14,
	},
];

/**
 * Step types for coordinating with map actions
 */
export type TourStepType =
	| "welcome"
	| "map-intro"
	| "fly-to-site"
	| "site-marker"
	| "site-panel"
	| "conclusion";

/**
 * Extended step with metadata for map coordination
 */
export interface TourStepMeta {
	type: TourStepType;
	siteIndex?: number; // Which TOUR_SITES index this step relates to
	requiresMapAction?: boolean; // Should we wait for map animation?
}

/**
 * Joyride step definitions for the interactive tour
 * Each step has associated metadata for map coordination
 */
export const TOUR_STEPS: Step[] = [
	// Step 0: Welcome
	{
		target: "body",
		content:
			"Welcome to Megalithic Mapper! 🗿 Explore ancient sites from around the world. Let's take a quick tour of the key features.",
		placement: "center",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 1: Map introduction
	{
		target: ".leaflet-container",
		content:
			"This is the interactive map. You can pan, zoom, and click on markers to explore archaeological sites. Let's fly to the Great Pyramid of Giza!",
		placement: "center",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 2: Giza marker (after flying)
	{
		target: ".leaflet-container",
		content:
			"Here's the Great Pyramid of Giza - one of the Seven Wonders of the Ancient World. Notice how the marker shows the site type. Click any marker to see details.",
		placement: "bottom",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 3: Site details panel
	{
		target: "[data-tour='site-panel']",
		content:
			"The details panel shows site information, photos, and links to research. You can explore related media and contribute your own findings.",
		placement: "left",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 4: Flying to Stonehenge
	{
		target: ".leaflet-container",
		content:
			"Now let's visit Stonehenge in England - a prehistoric stone circle. Notice how different site types have unique icons.",
		placement: "center",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 5: Stonehenge details
	{
		target: "[data-tour='site-panel']",
		content:
			"Each site has its own set of media, research links, and community contributions. You can follow sites to get updates.",
		placement: "left",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 6: Flying to Machu Picchu
	{
		target: ".leaflet-container",
		content:
			"Finally, let's explore Machu Picchu in Peru - showing how Megalithic Mapper covers sites across the globe.",
		placement: "center",
		disableBeacon: true,
		disableOverlayClose: true,
	},
	// Step 7: Conclusion
	{
		target: "body",
		content:
			"You're all set! 🎉 Explore the map, discover ancient sites, and contribute your own findings. The community grows with your participation.",
		placement: "center",
		disableBeacon: true,
		disableOverlayClose: true,
	},
];

/**
 * Metadata for each step - used by useInteractiveTour hook
 * Maps step index to actions needed
 */
export const TOUR_STEP_META: TourStepMeta[] = [
	{ type: "welcome" },
	{ type: "map-intro" },
	{ type: "fly-to-site", siteIndex: 0, requiresMapAction: true }, // Fly to Giza
	{ type: "site-panel", siteIndex: 0 },
	{ type: "fly-to-site", siteIndex: 1, requiresMapAction: true }, // Fly to Stonehenge
	{ type: "site-panel", siteIndex: 1 },
	{ type: "fly-to-site", siteIndex: 2, requiresMapAction: true }, // Fly to Machu Picchu
	{ type: "conclusion" },
];

/**
 * Get the site that should be displayed at a given step
 */
export function getSiteForStep(stepIndex: number): TourSite | null {
	const meta = TOUR_STEP_META[stepIndex];
	if (meta?.siteIndex !== undefined) {
		return TOUR_SITES[meta.siteIndex];
	}
	return null;
}

/**
 * Check if a step requires flying to a new location
 */
export function stepRequiresFlyTo(stepIndex: number): boolean {
	const meta = TOUR_STEP_META[stepIndex];
	return meta?.type === "fly-to-site" && meta?.requiresMapAction === true;
}

/**
 * Check if a step should show the site panel
 */
export function stepShowsPanel(stepIndex: number): boolean {
	const meta = TOUR_STEP_META[stepIndex];
	return meta?.type === "site-panel";
}

