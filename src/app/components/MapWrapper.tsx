"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component with no SSR to avoid maplibre-gl issues
const MapComponent = dynamic(() => import("./Map"), {
	ssr: false,
});

export default function MapWrapper() {
	return <MapComponent />;
}
