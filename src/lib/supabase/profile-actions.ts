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

// ============================================================================
// Site Follow Actions
// ============================================================================

export type SiteFollow = {
  site_id: string;
  notify_updates: boolean;
  notify_media: boolean;
  notify_comments: boolean;
  created_at: string;
};

export async function followSite(
  siteId: string,
  options?: { notifyUpdates?: boolean; notifyMedia?: boolean; notifyComments?: boolean }
) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const payload = {
    user_id: user.id,
    site_id: siteId,
    notify_updates: options?.notifyUpdates ?? true,
    notify_media: options?.notifyMedia ?? true,
    notify_comments: options?.notifyComments ?? true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("site_follows") as any).insert(payload);

  if (error) throw error;
}

export async function unfollowSite(siteId: string) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("site_follows") as any)
    .delete()
    .eq("user_id", user.id)
    .eq("site_id", siteId);

  if (error) throw error;
}

export async function isFollowingSite(siteId: string): Promise<boolean> {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_follows") as any)
    .select("site_id")
    .eq("user_id", user.id)
    .eq("site_id", siteId)
    .maybeSingle();

  if (error) {
    console.error("Error checking site follow status:", error);
    return false;
  }

  return !!data;
}

export async function getFollowedSites(): Promise<SiteFollow[]> {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_follows") as any)
    .select("site_id, notify_updates, notify_media, notify_comments, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching followed sites:", error);
    return [];
  }

  return data as SiteFollow[];
}

export async function updateSiteFollowPreferences(
  siteId: string,
  preferences: { notifyUpdates?: boolean; notifyMedia?: boolean; notifyComments?: boolean }
) {
  const supabase = await getServerClient();
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const updates: Record<string, boolean> = {};
  if (preferences.notifyUpdates !== undefined) updates.notify_updates = preferences.notifyUpdates;
  if (preferences.notifyMedia !== undefined) updates.notify_media = preferences.notifyMedia;
  if (preferences.notifyComments !== undefined) updates.notify_comments = preferences.notifyComments;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("site_follows") as any)
    .update(updates)
    .eq("user_id", user.id)
    .eq("site_id", siteId);

  if (error) throw error;
}

