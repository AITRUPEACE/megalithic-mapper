import { Suspense } from "react";
import { SiteExplorer } from "./_components/site-explorer";
import { fetchMapEntities } from "@/lib/map-data";
import { WORLD_BOUNDS } from "@/types/map";

export default async function MapPage() {
  const initialBounds = WORLD_BOUNDS;
  const { sites, zones } = await fetchMapEntities({ bounds: initialBounds });

  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading map...</div>}>
      <SiteExplorer initialSites={sites} initialZones={zones} initialBounds={initialBounds} />
    </Suspense>
  );
}
