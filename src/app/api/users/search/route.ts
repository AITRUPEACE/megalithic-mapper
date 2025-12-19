import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

interface ProfileRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  role: string;
  badge_tier?: string;
}

// GET /api/users/search?q=searchterm&limit=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapSchema = (supabase as any).schema(SUPABASE_SCHEMA);

    // Search by username or full_name (case-insensitive)
    const { data: users, error } = await mapSchema
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        is_verified,
        role,
        badge_tier
      `)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order("is_verified", { ascending: false })
      .order("username", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 }
      );
    }

    // Format response with additional computed fields
    const formattedUsers = ((users || []) as ProfileRow[]).map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      isVerified: user.is_verified,
      role: user.role,
      badgeTier: user.badge_tier || "explorer",
    }));

    return NextResponse.json({
      users: formattedUsers,
      count: formattedUsers.length,
      query,
    });
  } catch (error) {
    console.error("Error in GET /api/users/search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
