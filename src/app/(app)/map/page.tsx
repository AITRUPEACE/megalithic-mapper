import { Suspense } from "react";
import { SiteExplorer } from "./_components/site-explorer";
import { fetchMapEntities } from "@/entities/map/api/map-data";
import { WORLD_BOUNDS } from "@/entities/map/model/types";

export default function MapPage() {
	return (
		<div className="h-full w-full md:p-4 md:pb-4">
			<Suspense fallback={<div className="text-sm text-muted-foreground p-4">Loading map...</div>}>
				<MapPageContent />
			</Suspense>
		</div>
	);
}

const MapPageContent = async () => {
	const initialBounds = WORLD_BOUNDS;
	const { sites, zones } = await fetchMapEntities({ bounds: initialBounds });

	return <SiteExplorer initialSites={sites} initialZones={zones} initialBounds={initialBounds} />;
};
