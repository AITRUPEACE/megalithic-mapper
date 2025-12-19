import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";
import type { BoundingBox } from "@/entities/map/model/types";

/**
 * Smart Map Sites API
 * 
 * Returns sites within bounds, sorted by effective score (importance + decayed activity).
 * Limits results based on zoom level to prevent map overload.
 * 
 * GET /api/map/sites?bounds=minLat,minLng,maxLat,maxLng&zoom=5&siteTypes=pyramid,temple&minScore=50&limit=100
 */

// Zoom-based configuration
const ZOOM_CONFIG = {
  // zoom 1-4: World view - show only landmarks
  world: { maxSites: 50, minEffectiveScore: 70 },
  // zoom 5-7: Continent view
  continent: { maxSites: 75, minEffectiveScore: 50 },
  // zoom 8-10: Country view
  country: { maxSites: 100, minEffectiveScore: 30 },
  // zoom 11-13: Region view
  region: { maxSites: 150, minEffectiveScore: 10 },
  // zoom 14+: Local view - show everything
  local: { maxSites: 200, minEffectiveScore: 0 },
} as const;

function getZoomConfig(zoom: number) {
  if (zoom <= 4) return ZOOM_CONFIG.world;
  if (zoom <= 7) return ZOOM_CONFIG.continent;
  if (zoom <= 10) return ZOOM_CONFIG.country;
  if (zoom <= 13) return ZOOM_CONFIG.region;
  return ZOOM_CONFIG.local;
}

// Parse bounds from query string: "minLat,minLng,maxLat,maxLng"
function parseBounds(boundsStr: string | null): BoundingBox | null {
  if (!boundsStr) return null;
  
  const parts = boundsStr.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;
  
  const [minLat, minLng, maxLat, maxLng] = parts;
  
  // Validate ranges
  if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) return null;
  if (minLat > maxLat || minLng > maxLng) return null;
  
  return { minLat, minLng, maxLat, maxLng };
}

// Calculate the effective score SQL expression
// This combines base importance with time-decayed activity score
const EFFECTIVE_SCORE_SQL = `
  COALESCE(importance_score, 50) + COALESCE(
    activity_score * EXP(
      -EXTRACT(EPOCH FROM (NOW() - COALESCE(activity_updated_at, NOW() - INTERVAL '30 days'))) / 604800
    ),
    0
  )
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const bounds = parseBounds(searchParams.get("bounds"));
    const zoom = parseInt(searchParams.get("zoom") || "5", 10);
    const siteTypesParam = searchParams.get("siteTypes");
    const minScoreParam = searchParams.get("minScore");
    const limitParam = searchParams.get("limit");
    
    // Validate bounds
    if (!bounds) {
      return NextResponse.json(
        { error: "Invalid or missing bounds. Format: minLat,minLng,maxLat,maxLng" },
        { status: 400 }
      );
    }
    
    // Get zoom-based config
    const zoomConfig = getZoomConfig(zoom);
    
    // Parse optional filters
    const siteTypes = siteTypesParam 
      ? siteTypesParam.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const minScore = minScoreParam 
      ? Math.max(0, Math.min(100, parseInt(minScoreParam, 10)))
      : zoomConfig.minEffectiveScore;
    const limit = limitParam
      ? Math.max(1, Math.min(200, parseInt(limitParam, 10)))
      : zoomConfig.maxSites;
    
    // Initialize Supabase client
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);
    
    // First, get total count in bounds (for "showing X of Y" display)
    const { count: totalInBounds } = await mapSchema
      .from("sites")
      .select("*", { count: "exact", head: true })
      .gte("coordinates_lat", bounds.minLat)
      .lte("coordinates_lat", bounds.maxLat)
      .gte("coordinates_lng", bounds.minLng)
      .lte("coordinates_lng", bounds.maxLng);
    
    // Build main query
    // Note: Supabase JS client doesn't support computed columns in ORDER BY directly,
    // so we fetch and sort in application. For production with thousands of sites,
    // consider using a database view or RPC function.
    let query = mapSchema
      .from("sites")
      .select(`
        id, slug, name, summary, site_type, category, coordinates,
        verification_status, layer, trust_tier, zone_ids, media_count,
        related_research_ids, updated_at, updated_by,
        importance_score, activity_score, activity_updated_at,
        coordinates_lat, coordinates_lng, thumbnail_url
      `)
      .gte("coordinates_lat", bounds.minLat)
      .lte("coordinates_lat", bounds.maxLat)
      .gte("coordinates_lng", bounds.minLng)
      .lte("coordinates_lng", bounds.maxLng);
    
    // Apply site type filter if specified
    if (siteTypes.length > 0) {
      // Use site_type_id if available, otherwise fallback to site_type text match
      query = query.in("site_type_id", siteTypes);
    }
    
    // Order by importance first (activity decay will be applied client-side for now)
    query = query
      .order("importance_score", { ascending: false, nullsFirst: false })
      .order("activity_score", { ascending: false, nullsFirst: false });
    
    // Fetch more than needed to allow for filtering and proper sorting
    const { data: rawSites, error } = await query.limit(limit * 2);
    
    if (error) {
      console.error("Error fetching sites:", error);
      return NextResponse.json(
        { error: "Failed to fetch sites", details: error.message },
        { status: 500 }
      );
    }
    
    if (!rawSites) {
      return NextResponse.json({
        sites: [],
        meta: {
          total: 0,
          showing: 0,
          hasMore: false,
          hiddenCount: 0,
          zoom,
          bounds,
        },
      });
    }
    
    // Calculate effective score for each site and sort
    const now = Date.now();
    const DECAY_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    
    const sitesWithScore = rawSites.map(site => {
      const importanceScore = site.importance_score ?? 50;
      const activityScore = site.activity_score ?? 0;
      const activityUpdatedAt = site.activity_updated_at 
        ? new Date(site.activity_updated_at).getTime()
        : now - (30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
      
      // Calculate decay factor: e^(-time_elapsed / half_life)
      const timeSinceActivity = now - activityUpdatedAt;
      const decayFactor = Math.exp(-timeSinceActivity / DECAY_HALF_LIFE_MS);
      const decayedActivity = activityScore * decayFactor;
      
      const effectiveScore = importanceScore + decayedActivity;
      
      // Determine importance tier
      let importanceTier: "landmark" | "major" | "notable" | "minor";
      if (effectiveScore >= 80) importanceTier = "landmark";
      else if (effectiveScore >= 60) importanceTier = "major";
      else if (effectiveScore >= 40) importanceTier = "notable";
      else importanceTier = "minor";
      
      // Check if trending (high activity in last 7 days)
      const isTrending = activityScore > 20 && timeSinceActivity < DECAY_HALF_LIFE_MS;
      
      return {
        ...site,
        effectiveScore,
        importanceTier,
        isTrending,
        decayedActivityScore: decayedActivity,
      };
    });
    
    // Sort by effective score descending
    sitesWithScore.sort((a, b) => b.effectiveScore - a.effectiveScore);
    
    // Filter by minimum score
    const filteredSites = sitesWithScore.filter(s => s.effectiveScore >= minScore);
    
    // Apply limit
    const limitedSites = filteredSites.slice(0, limit);
    
    // Transform to response format
    const sites = limitedSites.map(site => ({
      id: site.id,
      slug: site.slug,
      name: site.name,
      summary: site.summary,
      siteType: site.site_type,
      category: site.category || "site",
      coordinates: site.coordinates || { lat: site.coordinates_lat, lng: site.coordinates_lng },
      verificationStatus: site.verification_status,
      layer: site.layer,
      trustTier: site.trust_tier,
      zoneIds: site.zone_ids || [],
      mediaCount: site.media_count || 0,
      relatedResearchIds: site.related_research_ids || [],
      updatedAt: site.updated_at,
      updatedBy: site.updated_by,
      thumbnailUrl: site.thumbnail_url || null,
      // Scoring fields
      importanceScore: site.importance_score ?? 50,
      activityScore: site.activity_score ?? 0,
      activityUpdatedAt: site.activity_updated_at,
      effectiveScore: Math.round(site.effectiveScore * 10) / 10,
      importanceTier: site.importanceTier,
      isTrending: site.isTrending,
    }));
    
    // Calculate metadata
    const total = totalInBounds ?? rawSites.length;
    const showing = sites.length;
    const hasMore = filteredSites.length > limit || (total > showing);
    const hiddenCount = Math.max(0, total - showing);
    
    return NextResponse.json({
      sites,
      meta: {
        total,
        showing,
        hasMore,
        hiddenCount,
        zoom,
        bounds,
        filters: {
          siteTypes: siteTypes.length > 0 ? siteTypes : null,
          minScore,
          limit,
        },
      },
    });
    
  } catch (error) {
    console.error("Error in GET /api/map/sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
