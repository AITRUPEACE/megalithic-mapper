import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/types"
import { ProfileEditForm } from "../_components/profile-edit-form"

export const metadata = {
  title: "Profile settings",
}

export default async function ProfileSettingsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login?next=/profile")
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  const profile: Profile = profileData ?? {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.full_name ?? user.email ?? "",
    tagline: null,
    location: null,
    affiliation: null,
    specialties: [],
    interests: [],
    bio: null,
    website: null,
    onboarding_complete: false,
    needs_verification_review: false,
    verification_status: "unverified",
  }

  return <ProfileEditForm profile={profile} />
}
