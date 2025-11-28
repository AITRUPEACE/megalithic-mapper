"use server";

import { createClient } from "./server";
import { onboardingSchema, type OnboardingValues, type ProfileRecord } from "./profile";

// Server client is already configured with megalithic schema via SUPABASE_CLIENT_OPTIONS
async function getServerClient() {
  const supabase = await createClient();
  return supabase;
}

/**
 * Get the authenticated user from the server.
 * Uses getUser() which verifies the JWT with Supabase (secure for server-side).
 * DO NOT use getSession() on the server - it doesn't verify the token.
 */
async function getAuthenticatedUser() {
  const supabase = await getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Auth error:", error.message);
    return null;
  }
  
  return user;
}

type FollowRow = {
  follower_id: string;
  following_id: string;
};

export async function completeOnboarding(values: OnboardingValues) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();

  if (!user?.id) {
    throw new Error("You need to be signed in to finish onboarding.");
  }

  const userId = user.id;

  const parsed = onboardingSchema.parse(values);
  const payload = {
    id: userId,
    username: parsed.username,
    full_name: parsed.fullName,
    headline: parsed.headline,
    location: parsed.location,
    expertise_tags: parsed.expertiseTags,
    contribution_intent: parsed.contributionIntent,
    collaboration_focus: parsed.collaborationFocus,
    notify_research_activity: parsed.notifyResearch,
    notify_product_updates: parsed.notifyProduct,
    onboarding_completed: true,
    default_viewport: parsed.defaultViewport,
    updated_at: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("profiles") as any)
    .upsert(payload, { onConflict: "id" })
    .select(
      `id, full_name, headline, location, expertise_tags, contribution_intent, collaboration_focus, notify_research_activity, notify_product_updates, onboarding_completed, default_viewport`
    )
    .single();

  if (error) {
    console.error("Failed to persist onboarding", error);
    throw new Error("Unable to save your onboarding progress right now.");
  }

  return data as ProfileRecord;
}

export async function followUser(targetUserId: string) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const payload: FollowRow = {
    follower_id: user.id,
    following_id: targetUserId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("follows") as any)
    .insert(payload);

  if (error) throw error;
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("follows") as any)
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) throw error;
}

