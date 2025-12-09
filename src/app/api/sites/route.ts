import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

// POST /api/sites - Create a new site
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, summary, siteType, category, coordinates, tags, zoneIds } = body;

    // Validate required fields
    if (!name?.trim() || !summary?.trim() || !siteType?.trim()) {
      return NextResponse.json(
        { error: "Name, summary, and siteType are required" },
        { status: 400 }
      );
    }

    if (!coordinates?.lat || !coordinates?.lng) {
      return NextResponse.json(
        { error: "Valid coordinates are required" },
        { status: 400 }
      );
    }

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    // Create the site
    const { data: site, error: siteError } = await mapSchema
      .from("sites")
      .insert({
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
        name: name.trim(),
        summary: summary.trim(),
        site_type: siteType.trim(),
        category: category || "site",
        coordinates: { lat: coordinates.lat, lng: coordinates.lng },
        layer: "community",
        verification_status: "under_review",
        trust_tier: "bronze",
        zone_ids: zoneIds || [],
        media_count: 0,
        related_research_ids: [],
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (siteError) {
      console.error("Error creating site:", siteError);
      return NextResponse.json(
        { error: "Failed to create site", details: siteError.message },
        { status: 500 }
      );
    }

    // Add tags if provided
    if (tags && site) {
      const tagInserts: { site_id: string; tag: string; tag_type: string }[] = [];
      
      if (tags.cultures?.length) {
        tags.cultures.forEach((tag: string) => {
          tagInserts.push({ site_id: site.id, tag: tag.trim(), tag_type: "culture" });
        });
      }
      if (tags.eras?.length) {
        tags.eras.forEach((tag: string) => {
          tagInserts.push({ site_id: site.id, tag: tag.trim(), tag_type: "era" });
        });
      }
      if (tags.themes?.length) {
        tags.themes.forEach((tag: string) => {
          tagInserts.push({ site_id: site.id, tag: tag.trim(), tag_type: "theme" });
        });
      }

      if (tagInserts.length > 0) {
        await mapSchema.from("site_tags").insert(tagInserts);
      }
    }

    return NextResponse.json({ 
      success: true, 
      site,
      message: "Site created and submitted for review"
    });
  } catch (error) {
    console.error("Error in POST /api/sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/sites - List sites (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // under_review, verified, unverified
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = mapSchema
      .from("sites")
      .select(`
        id, slug, name, summary, site_type, category, coordinates,
        verification_status, layer, trust_tier, zone_ids, media_count,
        related_research_ids, updated_at, updated_by, created_by, created_at,
        votes_approve, votes_reject, votes_needs_info
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data: sites, error } = await query;

    if (error) {
      console.error("Error fetching sites:", error);
      return NextResponse.json(
        { error: "Failed to fetch sites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error in GET /api/sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



