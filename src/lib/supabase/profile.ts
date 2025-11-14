import { z } from "zod";

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  expertise_tags: string[];
  contribution_intent: string | null;
  collaboration_focus: string | null;
  notify_research_activity: boolean;
  notify_product_updates: boolean;
  onboarding_completed: boolean;
  default_viewport: MapViewport | null;
}

export const viewportSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zoom: z.number().min(1).max(18),
});

export const onboardingSchema = z.object({
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

async function getServerClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase server helpers must be invoked on the server.");
  }

  const [{ cookies }, { createServerComponentClient }] = await Promise.all([
    import("next/headers"),
    import("@supabase/auth-helpers-nextjs"),
  ]);

  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration for server client.");
  }

  return createServerComponentClient(
    {
      cookies: () => cookieStore,
    },
    { supabaseUrl, supabaseKey }
  );
}

export async function getProfileForUser(userId: string): Promise<ProfileRecord | null> {
  if (!userId) return null;
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, full_name, headline, location, expertise_tags, contribution_intent, collaboration_focus, notify_research_activity, notify_product_updates, onboarding_completed, default_viewport`
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    throw new Error(error.message);
  }

  if (!data) return null;
  return {
    expertise_tags: data.expertise_tags ?? [],
    default_viewport: data.default_viewport ?? DEFAULT_VIEWPORT,
    ...data,
  } as ProfileRecord;
}

export async function completeOnboarding(values: OnboardingValues) {
  "use server";

  const supabase = await getServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You need to be signed in to finish onboarding.");
  }

  const parsed = onboardingSchema.parse(values);
  const payload = {
    id: userId,
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

  const { data, error } = await supabase
    .from("profiles")
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
