"use server";

import { fetchMapEntities } from "@/entities/map/api/map-data";
import type { MapQueryFilters } from "@/entities/map/api/map-data";

export const loadMapData = async (query: MapQueryFilters) => {
  return fetchMapEntities(query);
};
