import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

// GET /api/profile/onboarding - Check onboarding status
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Return completed=true for unauthenticated users to skip tour
      return NextResponse.json({ completed: true, skipped: false });
    }

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    const { data: profile, error } = await mapSchema
      .from("profiles")
      .select("onboarding_completed, onboarding_skipped")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching onboarding status:", error);
      // Default to completed to avoid showing tour on error
      return NextResponse.json({ completed: true, skipped: false });
    }

    return NextResponse.json({
      completed: profile?.onboarding_completed ?? false,
      skipped: profile?.onboarding_skipped ?? false,
    });
  } catch (error) {
    console.error("Error in GET /api/profile/onboarding:", error);
    return NextResponse.json({ completed: true, skipped: false });
  }
}

// POST /api/profile/onboarding - Update onboarding status
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { completed, skipped } = body;

    const mapSchema = supabase.schema(SUPABASE_SCHEMA);

    const updateData: Record<string, unknown> = {};
    
    if (completed !== undefined) {
      updateData.onboarding_completed = completed;
      if (completed) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }
    }
    
    if (skipped !== undefined) {
      updateData.onboarding_skipped = skipped;
    }

    const { error } = await mapSchema
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating onboarding status:", error);
      return NextResponse.json(
        { error: "Failed to update onboarding status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/profile/onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
