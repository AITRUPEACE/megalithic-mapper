import { Marker } from "react-map-gl/maplibre";
import { Site } from "../types/types";

interface SiteMarkerProps {
	site: Site;
	onSelect: (site: Site) => void;
}

export default function SiteMarker({ site, onSelect }: SiteMarkerProps) {
	const { color, hoverColor } = site.type;

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
			<div className="cursor-pointer">
				<div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-colors ${color} ${hoverColor}`} />
			</div>
		</Marker>
	);
}
