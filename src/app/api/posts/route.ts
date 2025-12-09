import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

// Helper to extract YouTube video info from URL
function parseYouTubeUrl(url: string): { videoId: string; thumbnail: string } | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  }
  return null;
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      body: postBody, 
      siteId, // Optional: link post to a site
      postType = "discussion",
      externalLinks = [], // Array of URLs
      mediaIds = [],
      visibility = "public"
    } = body;

    // Validate required fields
    if (!postBody?.trim()) {
      return NextResponse.json(
        { error: "Post body is required" },
        { status: 400 }
      );
    }

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    // Process external links (extract YouTube info, etc.)
    const processedLinks = externalLinks.map((link: string | { url: string }) => {
      const url = typeof link === "string" ? link : link.url;
      const ytInfo = parseYouTubeUrl(url);
      
      if (ytInfo) {
        return {
          url,
          type: "youtube",
          videoId: ytInfo.videoId,
          thumbnail: ytInfo.thumbnail,
        };
      }
      
      return {
        url,
        type: "link",
      };
    });

    // Generate excerpt
    const excerpt = postBody.slice(0, 200).trim() + (postBody.length > 200 ? "..." : "");

    // Create the post
    const { data: post, error: postError } = await mapSchema
      .from("posts")
      .insert({
        author_id: user.id,
        title: title?.trim() || null,
        body: postBody.trim(),
        body_format: "markdown",
        excerpt,
        target_type: siteId ? "site" : "general",
        target_id: siteId || null,
        post_type: postType,
        visibility,
        media_ids: mediaIds,
        external_links: processedLinks,
        published_at: visibility === "public" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      return NextResponse.json(
        { error: "Failed to create post", details: postError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      post,
      message: "Post created successfully"
    });
  } catch (error) {
    console.error("Error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/posts - List posts with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);
    
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");
    const authorId = searchParams.get("authorId");
    const postType = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = mapSchema
      .from("posts")
      .select(`
        id, title, body, body_format, excerpt,
        target_type, target_id, post_type, visibility,
        media_ids, external_links,
        likes_count, comments_count, shares_count, views_count,
        created_at, updated_at, published_at,
        author_id
      `)
      .eq("visibility", "public")
      .not("published_at", "is", null)
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (siteId) {
      query = query.eq("target_type", "site").eq("target_id", siteId);
    }

    if (authorId) {
      query = query.eq("author_id", authorId);
    }

    if (postType) {
      query = query.eq("post_type", postType);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    // Fetch author profiles
    const authorIds = [...new Set(posts?.map(p => p.author_id) || [])];
    let authors: Record<string, any> = {};
    
    if (authorIds.length > 0) {
      const { data: profiles } = await mapSchema
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_verified, role")
        .in("id", authorIds);
      
      authors = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    }

    // Attach author info to posts
    const postsWithAuthors = posts?.map(post => ({
      ...post,
      author: authors[post.author_id] || null,
    }));

    return NextResponse.json({ posts: postsWithAuthors });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



