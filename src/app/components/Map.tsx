"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, ViewStateChangeEvent, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import type { ViewState } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Site } from "../types/types";
import AddSiteModal from "./AddSiteModal";

// Sample megalithic sites data
const INITIAL_SITES: Site[] = [
	{
		id: "1",
		name: "Stonehenge",
		coordinates: [-1.826189, 51.178882],
		description: "Prehistoric monument in Wiltshire, England",
		type: "monument",
		status: "verified",
		images: [],
		documents: [],
		dateAdded: new Date().toISOString(),
		lastUpdated: new Date().toISOString(),
		addedBy: "system",
		tags: ["neolithic", "stone circle", "UK"],
	},
	{
		id: "2",
		name: "Carnac Stones",
		coordinates: [-3.083333, 47.583333],
		description: "Neolithic site in Brittany, France",
		type: "monument",
		status: "verified",
		images: [],
		documents: [],
		dateAdded: new Date().toISOString(),
		lastUpdated: new Date().toISOString(),
		addedBy: "system",
		tags: ["neolithic", "standing stones", "France"],
	},
	{
		id: "3",
		name: "Callanish Stones",
		coordinates: [-6.74512, 58.197807],
		description: "Stone circle in Scotland",
		type: "monument",
		status: "verified",
		images: [],
		documents: [],
		dateAdded: new Date().toISOString(),
		lastUpdated: new Date().toISOString(),
		addedBy: "system",
		tags: ["neolithic", "stone circle", "Scotland"],
	},
];

export default function MapComponent() {
	const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
	const [selectedSite, setSelectedSite] = useState<Site | null>(null);
	const [isAddingNewSite, setIsAddingNewSite] = useState(false);
	const [newSiteCoordinates, setNewSiteCoordinates] = useState<[number, number] | null>(null);
	const [viewState, setViewState] = useState({
		longitude: -2,
		latitude: 52,
		zoom: 5,
		bearing: 0,
		pitch: 0,
	});

	const handleMapClick = (evt: any) => {
		if (isAddingNewSite) {
			setNewSiteCoordinates([evt.lngLat.lng, evt.lngLat.lat]);
		}
	};

	const handleAddSite = (siteData: Partial<Site>) => {
		const newSite: Site = {
			...siteData,
			id: Date.now().toString(),
			coordinates: newSiteCoordinates!,
			images: [],
			documents: [],
			dateAdded: new Date().toISOString(),
			lastUpdated: new Date().toISOString(),
			addedBy: "user",
			status: "unverified",
		} as Site;

		setSites([...sites, newSite]);
		setIsAddingNewSite(false);
		setNewSiteCoordinates(null);
	};

	return (
		<div className="relative w-full h-full">
			<Map
				{...viewState}
				onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
				onClick={handleMapClick}
				style={{ width: "100%", height: "100%" }}
				mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=pURpTOeFg5kpjwFTldok"
				mapLib={maplibregl}
			>
				{/* Map Controls */}
				<NavigationControl position="top-right" />
				<FullscreenControl position="top-right" />

				{/* Add Site Button - as a map control */}
				<div className="mapboxgl-ctrl mapboxgl-ctrl-group" style={{ position: "absolute", top: 120, right: 10 }}>
					<button
						className="px-3 py-2 flex items-center justify-center bg-white hover:bg-gray-100 text-black dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium"
						onClick={() => setIsAddingNewSite(!isAddingNewSite)}
						title={isAddingNewSite ? "Cancel Adding Site" : "Add New Site"}
					>
						{isAddingNewSite ? "Cancel Adding Site" : "Add New Site"}
					</button>
				</div>

				{/* Site Markers */}
				{sites.map((site) => (
					<Marker
						key={site.id}
						longitude={site.coordinates[0]}
						latitude={site.coordinates[1]}
						anchor="bottom"
						onClick={(e) => {
							e.originalEvent.stopPropagation();
							setSelectedSite(site);
						}}
					>
						<div className="cursor-pointer">
							<div
								className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-colors ${
									site.status === "verified" ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
								}`}
							/>
						</div>
					</Marker>
				))}

				{/* New Site Marker */}
				{newSiteCoordinates && (
					<Marker longitude={newSiteCoordinates[0]} latitude={newSiteCoordinates[1]} anchor="bottom">
						<div className="cursor-pointer">
							<div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
						</div>
					</Marker>
				)}

				{/* Instructions Overlay */}
				{isAddingNewSite && (
					<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 160, right: 10 }}>
						<div className="bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-lg">
							<p className="text-sm text-black dark:text-white">Click on the map to place a new site</p>
						</div>
					</div>
				)}

				{/* Selected Site Info */}
				{selectedSite && (
					<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 10, left: 10 }}>
						<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg max-w-sm">
							<h3 className="text-lg font-bold text-black dark:text-white">{selectedSite.name}</h3>
							<p className="text-sm mt-1 text-black dark:text-gray-200">{selectedSite.description}</p>
							<div className="mt-2">
								<span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white">
									{selectedSite.type}
								</span>
								{selectedSite.civilization && (
									<span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white">
										{selectedSite.civilization}
									</span>
								)}
							</div>
							<div className="mt-2 flex flex-wrap gap-1">
								{selectedSite.tags.map((tag) => (
									<span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
										{tag}
									</span>
								))}
							</div>
							<button
								className="mt-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
								onClick={() => setSelectedSite(null)}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</Map>

			<AddSiteModal
				isOpen={!!newSiteCoordinates}
				onClose={() => {
					setNewSiteCoordinates(null);
					setIsAddingNewSite(false);
				}}
				onSubmit={handleAddSite}
				coordinates={newSiteCoordinates || undefined}
			/>
		</div>
	);
}
