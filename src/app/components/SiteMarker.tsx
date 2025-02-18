import { Marker } from "react-map-gl/maplibre";
import { Site } from "../types/types";
import { useState } from "react";

interface SiteMarkerProps {
	site: Site;
	onSelect: (site: Site) => void;
}

export default function SiteMarker({ site, onSelect }: SiteMarkerProps) {
	const { color, hoverColor } = site.type;
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Marker
			longitude={site.coordinates[0]}
			latitude={site.coordinates[1]}
			anchor="bottom"
			onClick={(e) => {
				e.originalEvent.stopPropagation();
				onSelect(site);
			}}
		>
			<div className="cursor-pointer relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
				<div
					className="absolute -translate-x-1/2 left-1/2 bottom-8 whitespace-nowrap px-2 py-1 rounded-md bg-background/70 backdrop-blur-sm text-sm transition-opacity duration-200 shadow-sm"
					style={{
						opacity: isHovered ? 1 : 0,
						pointerEvents: "none",
					}}
				>
					{site.name}
				</div>
				<div
					className="w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200"
					style={{
						backgroundColor: isHovered ? hoverColor : color,
						transform: isHovered ? "scale(1.2)" : "scale(1)",
					}}
				/>
			</div>
		</Marker>
	);
}
