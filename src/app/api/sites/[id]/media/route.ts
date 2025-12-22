import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

export interface SiteMediaItem {
  id: string;
  url: string;
  thumbnail: string | null;
  title: string;
  description: string | null;
  contributor: string;
  createdAt: string;
  likes?: number;
  comments?: number;
}

// GET /api/sites/[id]/media - Fetch media assets for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Fetch media assets for the site
    const { data: mediaAssets, error } = await mapSchema
      .from("media_assets")
      .select(`
        id,
        url,
        thumbnail_url,
        title,
        description,
        contributor_name,
        created_at
      `)
      .eq("site_id", siteId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching media assets:", error);
      return NextResponse.json(
        { error: "Failed to fetch media", details: error.message },
        { status: 500 }
      );
    }

    // Transform to client format
    const media: SiteMediaItem[] = (mediaAssets || []).map((asset) => ({
      id: asset.id,
      url: asset.url,
      thumbnail: asset.thumbnail_url || asset.url,
      title: asset.title,
      description: asset.description,
      contributor: asset.contributor_name,
      createdAt: asset.created_at,
      // Placeholder values until we have a likes/comments system for media
      likes: 0,
      comments: 0,
    }));

    return NextResponse.json({ media, total: media.length });
  } catch (error) {
    console.error("Error in GET /api/sites/[id]/media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

