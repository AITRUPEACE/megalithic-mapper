import { Marker } from "react-map-gl/maplibre";
import { SiteGroup } from "../types/types";
import { Badge } from "@/components/ui/badge";
import { useSiteStore } from "../store/useSiteStore";

interface GroupMarkerProps {
	group: SiteGroup;
	onSelect: (group: SiteGroup) => void;
}

export default function GroupMarker({ group, onSelect }: GroupMarkerProps) {
	const { sites } = useSiteStore();
	const groupSites = sites.filter((site) => site.groupId === group.id);

	return (
		<Marker longitude={group.coordinates[0]} latitude={group.coordinates[1]} anchor="center">
			<div className="cursor-pointer group" onClick={() => onSelect(group)} title={group.name}>
				<div className="relative">
					<div className="w-12 h-12 bg-primary/80 rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:bg-primary transition-colors">
						<Badge variant="secondary" className="absolute -top-2 -right-2">
							{groupSites.length}
						</Badge>
						<span className="text-white text-xs font-semibold">
							{group.name
								.split(" ")
								.map((word) => word[0])
								.join("")}
						</span>
					</div>
				</div>
			</div>
		</Marker>
	);
}
