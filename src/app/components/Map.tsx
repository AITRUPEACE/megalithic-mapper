"use client";

import Map, { Marker, ViewStateChangeEvent, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Site, SiteGroup } from "../types/types";
import AddSiteModal from "./AddSiteModal";
import SiteMarker from "./SiteMarker";
import GroupMarker from "./GroupMarker";
import SiteInfo from "./SiteInfo";
import SiteList from "./SiteList";
import Legend from "./Legend";
import { useSiteStore } from "../store/useSiteStore";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Zoom level threshold for switching between group and individual markers
const GROUP_ZOOM_THRESHOLD = 8;

export default function MapComponent() {
	const {
		sites,
		siteGroups,
		selectedSite,
		selectedGroup,
		isAddingNewSite,
		newSiteCoordinates,
		viewState,
		setSelectedSite,
		setSelectedGroup,
		setIsAddingNewSite,
		setNewSiteCoordinates,
		addSite,
		setViewState,
		updateSite,
	} = useSiteStore();

	const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
	const [longitude, setLongitude] = useState(0);
	const [latitude, setLatitude] = useState(0);

	// Determine which sites to show based on zoom level
	const visibleSites = useMemo(() => {
		if (viewState.zoom >= GROUP_ZOOM_THRESHOLD) {
			// Show all sites when zoomed in
			return sites;
		} else {
			// When zoomed out, only show ungrouped sites
			return sites.filter((site) => !site.groupId);
		}
	}, [sites, viewState.zoom]);

	const handleMapClick = (evt: maplibregl.MapLayerMouseEvent) => {
		if (isAddingNewSite) {
			setNewSiteCoordinates([evt.lngLat.lng, evt.lngLat.lat]);
		} else if (isUpdatingLocation && selectedSite) {
			const updatedSite: Site = {
				...selectedSite,
				coordinates: [evt.lngLat.lng, evt.lngLat.lat],
				lastUpdated: new Date().toISOString(),
			};
			updateSite(updatedSite);
			setIsUpdatingLocation(false);
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

		addSite(newSite);
		setIsAddingNewSite(false);
		setNewSiteCoordinates(null);
	};

	const handleUpdateLocation = () => {
		if (selectedSite) {
			setIsUpdatingLocation(true);
		}
	};

	const handleGroupSelect = (group: SiteGroup) => {
		setSelectedGroup(group);
		// Zoom to group
		setViewState({
			...viewState,
			longitude: group.coordinates[0],
			latitude: group.coordinates[1],
			zoom: GROUP_ZOOM_THRESHOLD + 1, // Zoom in just past the threshold
		});
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

				{/* Add Site Button */}
				<div className="mapboxgl-ctrl mapboxgl-ctrl-group" style={{ position: "absolute", top: 10, right: 60 }}>
					<Button
						variant="secondary"
						onClick={() => setIsAddingNewSite(!isAddingNewSite)}
						title={isAddingNewSite ? "Cancel Adding Site" : "Add New Site"}
					>
						{isAddingNewSite ? "Cancel Adding Site" : "Add New Site"}
					</Button>
				</div>

				{/* Group Markers (shown when zoomed out) */}
				{viewState.zoom < GROUP_ZOOM_THRESHOLD &&
					siteGroups.map((group) => <GroupMarker key={group.id} group={group} onSelect={handleGroupSelect} />)}

				{/* Site Markers */}
				{visibleSites.map((site) => (
					<SiteMarker key={site.id} site={site} onSelect={setSelectedSite} />
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
				{(isAddingNewSite || isUpdatingLocation) && (
					<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 160, right: 10 }}>
						<div className="map-overlay px-3 py-2 rounded shadow-lg space-y-2">
							<p className="text-sm">{isAddingNewSite ? "Click on the map to place a new site" : "Click on the map to update site location"}</p>
							<div className="flex gap-2 items-center">
								<Input
									type="number"
									placeholder="Longitude"
									className="w-24 h-8"
									step="0.000001"
									onChange={(e) => setLongitude(parseFloat(e.target.value))}
								/>
								<Input
									type="number"
									placeholder="Latitude"
									className="w-24 h-8"
									step="0.000001"
									onChange={(e) => setLatitude(parseFloat(e.target.value))}
								/>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										if (longitude && latitude) {
											if (isAddingNewSite) {
												setNewSiteCoordinates([longitude, latitude]);
											} else if (isUpdatingLocation && selectedSite) {
												const updatedSite: Site = {
													...selectedSite,
													coordinates: [longitude, latitude],
													lastUpdated: new Date().toISOString(),
												};
												updateSite(updatedSite);
												setIsUpdatingLocation(false);
											}
										}
									}}
								>
									Set
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Selected Site Info */}
				{selectedSite && <SiteInfo site={selectedSite} onClose={() => setSelectedSite(null)} onUpdateLocation={handleUpdateLocation} />}

				{/* Site List */}
				<SiteList />

				{/* Legend */}
				<Legend />
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
