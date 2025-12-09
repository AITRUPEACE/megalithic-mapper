import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

// POST /api/sites/[id]/vote - Vote on a site
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voteType, reason } = body;

    // Validate vote type
    if (!["approve", "reject", "needs_info"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid vote type. Must be: approve, reject, or needs_info" },
        { status: 400 }
      );
    }

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    // Check if site exists
    const { data: site, error: siteError } = await mapSchema
      .from("sites")
      .select("id, name, verification_status")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check for existing vote
    const { data: existingVote } = await mapSchema
      .from("site_votes")
      .select("id, vote_type")
      .eq("user_id", user.id)
      .eq("site_id", siteId)
      .single();

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await mapSchema
        .from("site_votes")
        .update({
          vote_type: voteType,
          reason: reason || null,
        })
        .eq("id", existingVote.id);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return NextResponse.json(
          { error: "Failed to update vote" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: "Vote updated",
        previousVote: existingVote.vote_type,
        newVote: voteType
      });
    }

    // Create new vote
    const { error: voteError } = await mapSchema
      .from("site_votes")
      .insert({
        user_id: user.id,
        site_id: siteId,
        vote_type: voteType,
        reason: reason || null,
      });

    if (voteError) {
      console.error("Error creating vote:", voteError);
      return NextResponse.json(
        { error: "Failed to create vote", details: voteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Vote recorded",
      vote: voteType
    });
  } catch (error) {
    console.error("Error in POST /api/sites/[id]/vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/sites/[id]/vote - Get user's vote and vote counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const supabase = await createClient();
    const mapSchema = supabase.schema(SUPABASE_SCHEMA);
    
    // Get site vote counts
    const { data: site, error: siteError } = await mapSchema
      .from("sites")
      .select("votes_approve, votes_reject, votes_needs_info, verification_status")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get user's vote if authenticated
    let userVote = null;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: vote } = await mapSchema
        .from("site_votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("site_id", siteId)
        .single();
      
      userVote = vote?.vote_type || null;
    }

    return NextResponse.json({
      votes: {
        approve: site.votes_approve || 0,
        reject: site.votes_reject || 0,
        needs_info: site.votes_needs_info || 0,
      },
      verificationStatus: site.verification_status,
      userVote,
    });
  } catch (error) {
    console.error("Error in GET /api/sites/[id]/vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[id]/vote - Remove user's vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    const { error } = await mapSchema
      .from("site_votes")
      .delete()
      .eq("user_id", user.id)
      .eq("site_id", siteId);

    if (error) {
      console.error("Error deleting vote:", error);
      return NextResponse.json(
        { error: "Failed to delete vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Vote removed" });
  } catch (error) {
    console.error("Error in DELETE /api/sites/[id]/vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



