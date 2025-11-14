"use server";

import { fetchMapEntities } from "@/lib/map-data";
import type { MapQueryFilters } from "@/lib/map-data";

export const loadMapData = async (query: MapQueryFilters) => {
  return fetchMapEntities(query);
};
