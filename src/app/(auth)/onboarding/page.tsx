import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/types"
import { OnboardingWizard } from "../_components/onboarding-wizard"

export const metadata = {
  title: "Complete your profile",
}

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login?next=/onboarding")
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return <OnboardingWizard profile={profileData as Profile | null} />
}
