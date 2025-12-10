import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

// GET /api/feed - Get activity feed
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);
    
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort") || "smart"; // smart, hot, new, top
    const siteId = searchParams.get("siteId"); // Filter by site
    const activityType = searchParams.get("type"); // Filter by type
    const sourceFilter = searchParams.get("source") || "all"; // all, official, community
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Check if activity_feed table exists, if not fall back to posts
    const { data: tableCheck } = await supabase.rpc("to_regclass", {
      relation: "megalithic.activity_feed"
    }).single();

    // If activity_feed table doesn't exist, fall back to posts + sites
    if (!tableCheck) {
      return await getFallbackFeed(mapSchema, { sortBy, siteId, activityType, limit, offset });
    }

    let query = mapSchema
      .from("activity_feed")
      .select(`
        id, activity_type, actor_id, target_type, target_id, site_id,
        title, description, thumbnail_url, metadata, engagement_score,
        created_at, source_type, change_type, change_magnitude, media_count, change_details
      `)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (siteId) {
      query = query.eq("site_id", siteId);
    }

    if (activityType) {
      query = query.eq("activity_type", activityType);
    }

    // Apply source filter (official/community)
    if (sourceFilter && sourceFilter !== "all") {
      query = query.eq("source_type", sourceFilter);
    }

    // For community-only view, filter out low-impact updates without engagement
    if (sourceFilter === "community") {
      // Only show community updates with magnitude >= 40 OR engagement >= 5
      query = query.or("change_magnitude.gte.40,engagement_score.gte.5");
    }

    // Apply sorting
    switch (sortBy) {
      case "smart":
        // Smart sort: prioritize by magnitude + official status + recency
        // Official sources first, then by magnitude, then engagement, then time
        query = query
          .order("source_type", { ascending: true }) // 'community' < 'official' alphabetically, we want official first
          .order("change_magnitude", { ascending: false, nullsFirst: false })
          .order("engagement_score", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      case "hot":
        query = query.order("engagement_score", { ascending: false })
                     .order("created_at", { ascending: false });
        break;
      case "top":
        query = query.order("engagement_score", { ascending: false });
        break;
      case "new":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        // Default to smart sort
        query = query
          .order("change_magnitude", { ascending: false, nullsFirst: false })
          .order("engagement_score", { ascending: false })
          .order("created_at", { ascending: false });
        break;
    }

    const { data: feedItems, error } = await query;

    if (error) {
      console.error("Error fetching feed:", error);
      return NextResponse.json(
        { error: "Failed to fetch feed" },
        { status: 500 }
      );
    }

    // Fetch actor profiles
    const actorIds = [...new Set(feedItems?.map(f => f.actor_id).filter(Boolean) || [])];
    let actors: Record<string, any> = {};
    
    if (actorIds.length > 0) {
      const { data: profiles } = await mapSchema
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_verified, role")
        .in("id", actorIds);
      
      actors = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    }

    // Attach actor info to feed items
    const feedWithActors = feedItems?.map(item => ({
      ...item,
      actor: item.actor_id ? actors[item.actor_id] : null,
      // Provide default values for new columns if they don't exist yet
      source_type: item.source_type || "community",
      change_type: item.change_type || mapActivityToChangeType(item.activity_type),
      change_magnitude: item.change_magnitude || getDefaultMagnitude(item.activity_type),
      media_count: item.media_count || 0,
    }));

    return NextResponse.json({ 
      feed: feedWithActors,
      meta: {
        sortBy,
        sourceFilter,
        limit,
        offset,
        count: feedItems?.length || 0,
      }
    });
  } catch (error) {
    console.error("Error in GET /api/feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fallback: Generate feed from posts and recent sites if activity_feed table doesn't exist
async function getFallbackFeed(
  mapSchema: ReturnType<typeof createClient extends (...args: any) => infer R ? R : never>["schema"],
  options: { sortBy: string; siteId: string | null; activityType: string | null; limit: number; offset: number }
) {
  const { sortBy, siteId, activityType, limit, offset } = options;

  // Get recent posts
  let postsQuery = mapSchema
    .from("posts")
    .select(`
      id, title, body, excerpt, author_id, target_type, target_id,
      post_type, likes_count, comments_count, views_count,
      external_links, created_at, published_at
    `)
    .eq("visibility", "public")
    .not("published_at", "is", null)
    .is("deleted_at", null);

  if (siteId) {
    postsQuery = postsQuery.eq("target_type", "site").eq("target_id", siteId);
  }

  // Get recent sites
  let sitesQuery = mapSchema
    .from("sites")
    .select(`
      id, name, summary, site_type, created_by, created_at, updated_at,
      verification_status, votes_approve
    `);

  if (siteId) {
    sitesQuery = sitesQuery.eq("id", siteId);
  }

  const [postsResult, sitesResult] = await Promise.all([
    postsQuery.order("published_at", { ascending: false }).limit(limit),
    sitesQuery.order("created_at", { ascending: false }).limit(limit),
  ]);

  const posts = postsResult.data || [];
  const sites = sitesResult.data || [];

  // Convert to feed format
  const feedItems = [
    ...posts.map(post => ({
      id: `post-${post.id}`,
      activity_type: "post_created",
      actor_id: post.author_id,
      target_type: "post",
      target_id: post.id,
      site_id: post.target_type === "site" ? post.target_id : null,
      title: post.title || "New post",
      description: post.excerpt || post.body?.slice(0, 150),
      thumbnail_url: post.external_links?.[0]?.thumbnail || null,
      metadata: { external_links: post.external_links },
      engagement_score: (post.likes_count || 0) + (post.comments_count || 0) * 2,
      created_at: post.published_at || post.created_at,
    })),
    ...sites.map(site => ({
      id: `site-${site.id}`,
      activity_type: site.verification_status === "verified" ? "site_verified" : "site_added",
      actor_id: site.created_by,
      target_type: "site",
      target_id: site.id,
      site_id: site.id,
      title: `New site: ${site.name}`,
      description: site.summary?.slice(0, 150),
      thumbnail_url: null,
      metadata: { site_type: site.site_type },
      engagement_score: site.votes_approve || 0,
      created_at: site.created_at,
    })),
  ];

  // Sort
  if (sortBy === "hot" || sortBy === "top") {
    feedItems.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
  } else {
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Paginate
  const paginatedFeed = feedItems.slice(offset, offset + limit);

  // Fetch actor profiles
  const actorIds = [...new Set(paginatedFeed.map(f => f.actor_id).filter(Boolean))];
  let actors: Record<string, any> = {};
  
  if (actorIds.length > 0) {
    const { data: profiles } = await mapSchema
      .from("profiles")
      .select("id, username, full_name, avatar_url, is_verified, role")
      .in("id", actorIds);
    
    actors = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  }

  const feedWithActors = paginatedFeed.map(item => ({
    ...item,
    actor: item.actor_id ? actors[item.actor_id] : null,
  }));

  return NextResponse.json({ 
    feed: feedWithActors,
    meta: {
      sortBy,
      sourceFilter: "all",
      limit,
      offset,
      count: paginatedFeed.length,
      isFallback: true,
    }
  });
}

// Helper: Map activity type to change type
function mapActivityToChangeType(activityType: string): string {
  const mapping: Record<string, string> = {
    site_added: "new_site",
    site_verified: "site_verified",
    site_updated: "metadata_updated",
    media_added: "photos_added",
    post_created: "post_created",
    comment_added: "post_created",
    user_joined: "metadata_updated",
    badge_earned: "milestone",
    connection_proposed: "connection_proposed",
  };
  return mapping[activityType] || "metadata_updated";
}

// Helper: Get default magnitude for activity type
function getDefaultMagnitude(activityType: string): number {
  const magnitudes: Record<string, number> = {
    site_added: 100,
    site_verified: 90,
    media_added: 70,
    post_created: 60,
    comment_added: 40,
    site_updated: 30,
    user_joined: 20,
    badge_earned: 50,
    connection_proposed: 70,
  };
  return magnitudes[activityType] || 50;
}


