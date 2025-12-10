/**
 * API Route for fetching external site data
 * 
 * GET /api/external-sites - Fetch sites from Wikidata and OSM
 * GET /api/external-sites?source=wikidata - Fetch only from Wikidata
 * GET /api/external-sites?source=osm - Fetch only from OSM
 * GET /api/external-sites?type=stone_circles - Fetch specific type
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchAllExternalSites,
  calculateImportStats,
  generateSiteInsertSQL,
} from "@/lib/external-data/site-importer";
import {
  fetchStoneCirclesFromWikidata,
  fetchPyramidsFromWikidata,
  fetchUnescoArchaeologicalSites,
  searchWikidataSite,
} from "@/lib/external-data/wikidata";
import {
  fetchSitesByType,
  fetchSitesInBoundingBox,
  fetchNearbySites,
} from "@/lib/external-data/openstreetmap";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for external API calls

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source"); // wikidata, osm, or all
  const type = searchParams.get("type"); // stone_circles, pyramids, etc.
  const search = searchParams.get("search"); // Search query
  const format = searchParams.get("format"); // json (default) or sql
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const bbox = searchParams.get("bbox"); // minLat,minLng,maxLat,maxLng

  try {
    // Search mode
    if (search) {
      const results = await searchWikidataSite(search);
      return NextResponse.json({
        success: true,
        query: search,
        count: results.length,
        sites: results,
      });
    }

    // Nearby search
    if (lat && lng) {
      const sites = await fetchNearbySites(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius, 10) : 50000
      );
      return NextResponse.json({
        success: true,
        count: sites.length,
        sites,
      });
    }

    // Bounding box search
    if (bbox) {
      const [minLat, minLng, maxLat, maxLng] = bbox.split(",").map(parseFloat);
      const sites = await fetchSitesInBoundingBox(minLat, minLng, maxLat, maxLng);
      return NextResponse.json({
        success: true,
        count: sites.length,
        sites,
      });
    }

    // Specific type from specific source
    if (type && source === "osm") {
      const validTypes = ["stone_circles", "standing_stones", "dolmens", "pyramids", "tumuli"] as const;
      if (!validTypes.includes(type as typeof validTypes[number])) {
        return NextResponse.json(
          { error: `Invalid type. Valid types: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
      const sites = await fetchSitesByType(type as typeof validTypes[number]);
      return NextResponse.json({
        success: true,
        source: "osm",
        type,
        count: sites.length,
        sites,
      });
    }

    // Specific Wikidata queries
    if (source === "wikidata") {
      let sites;
      if (type === "stone_circles") {
        sites = await fetchStoneCirclesFromWikidata();
      } else if (type === "pyramids") {
        sites = await fetchPyramidsFromWikidata();
      } else if (type === "unesco") {
        sites = await fetchUnescoArchaeologicalSites();
      } else {
        // Fetch all from Wikidata
        const { fetchAllWikidataSites } = await import("@/lib/external-data/wikidata");
        sites = await fetchAllWikidataSites();
      }
      return NextResponse.json({
        success: true,
        source: "wikidata",
        type: type || "all",
        count: sites.length,
        sites,
      });
    }

    // Fetch from all sources (unified)
    const includeWikidata = source !== "osm";
    const includeOSM = source !== "wikidata";
    
    const siteTypes = type
      ? [type as "stone_circles" | "standing_stones" | "dolmens" | "pyramids" | "tumuli"]
      : undefined;

    const sites = await fetchAllExternalSites({
      includeWikidata,
      includeOSM,
      siteTypes,
    });

    const stats = calculateImportStats(sites);

    // Return SQL format if requested
    if (format === "sql") {
      const sql = generateSiteInsertSQL(sites);
      return new NextResponse(sql, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": "attachment; filename=sites-import.sql",
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats,
      sites: sites.slice(0, 100), // Limit response size
      totalAvailable: sites.length,
      message: sites.length > 100 ? "Showing first 100 sites. Use ?format=sql to get all as SQL." : undefined,
    });
  } catch (error) {
    console.error("External sites API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}












