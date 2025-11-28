import { z } from "zod";
import { createClient } from "./server";

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface ProfileRecord {
  id: string;
  username: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website_url: string | null;
  role: string;
  is_verified: boolean;
  expertise_tags: string[];
  contribution_intent: string | null;
  collaboration_focus: string | null;
  notify_research_activity: boolean;
  notify_product_updates: boolean;
  onboarding_completed: boolean;
  default_viewport: MapViewport | null;
}

export interface PublicBadge {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: string;
  awardedAt: string;
}

export interface PublicProfile extends ProfileRecord {
  badges: PublicBadge[];
  stats: {
    contributions: number;
    followers: number;
    following: number;
  };
}

type BadgeJoinRow = {
  awarded_at: string;
  badge: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon_url: string | null;
    category: string;
  };
};

export const viewportSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zoom: z.number().min(1).max(18),
});

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be under 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  fullName: z.string().min(2, "Please share your full name."),
  headline: z
    .string()
    .min(6, "Add a short headline so collaborators understand your focus."),
  location: z
    .string()
    .min(2, "Location helps the team recommend nearby discoveries.")
    .nullable(),
  defaultViewport: viewportSchema,
  expertiseTags: z
    .array(z.string().min(2))
    .min(1, "Add at least one expertise tag to guide recommendations."),
  contributionIntent: z
    .string()
    .min(20, "Describe how you plan to contribute to the community."),
  collaborationFocus: z
    .string()
    .min(10, "Tell others what kinds of collaborations you want.")
    .nullable(),
  notifyResearch: z.boolean(),
  notifyProduct: z.boolean(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const DEFAULT_VIEWPORT: MapViewport = { latitude: 20, longitude: 0, zoom: 2 };

// Server client is already configured with megalithic schema via SUPABASE_CLIENT_OPTIONS
async function getServerClient() {
  const supabase = await createClient();
  return supabase;
}

export async function getProfileForUser(userId: string): Promise<ProfileRecord | null> {
  if (!userId) return null;
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, username, full_name, headline, bio, avatar_url, location, website_url, role, is_verified, expertise_tags, contribution_intent, collaboration_focus, notify_research_activity, notify_product_updates, onboarding_completed, default_viewport`
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    throw new Error(error.message);
  }

  if (!data) return null;
  const profileRow = data as ProfileRecord;
  return {
    ...profileRow,
    expertise_tags: profileRow.expertise_tags ?? [],
    default_viewport: profileRow.default_viewport ?? DEFAULT_VIEWPORT,
  };
}


export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
  const supabase = await getServerClient();
  
  // 1. Get Profile
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  if (!profileData) return null;
  const profile = profileData as ProfileRecord;

  // 2. Get Badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(`
      awarded_at,
      badge:badges (
        id, slug, name, description, icon_url, category
      )
    `)
    .eq("user_id", profile.id);

  // 3. Get Stats (Mocked or counts)
  const { count: followersCount } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("following_id", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  const badgeRows: BadgeJoinRow[] = (userBadges ?? []) as BadgeJoinRow[];

  // Map to PublicProfile format
  return {
    ...profile,
    expertise_tags: profile.expertise_tags ?? [],
    default_viewport: profile.default_viewport ?? DEFAULT_VIEWPORT,
    badges:
      badgeRows.map((badge) => ({
        id: badge.badge.id,
        slug: badge.badge.slug,
        name: badge.badge.name,
        description: badge.badge.description,
        iconUrl: badge.badge.icon_url,
        category: badge.badge.category,
        awardedAt: badge.awarded_at,
      })) ?? [],
    stats: {
      contributions: 0, 
      followers: followersCount ?? 0,
      following: followingCount ?? 0
    }
  };
}


export async function isFollowing(targetUserId: string) {
  const supabase = await getServerClient();
  // Use getUser() for secure server-side auth (verifies JWT with Supabase)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return !!data;
}
