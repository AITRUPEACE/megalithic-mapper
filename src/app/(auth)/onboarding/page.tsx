import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";
import { getProfileForUser } from "@/lib/repos/profile-repo";
import { UserStoreHydrator } from "./user-store-hydrator";
import { getServerSupabaseClient } from "@/lib/supabase/client";

export default async function OnboardingPage() {
  const supabase = await getServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const profile = await getProfileForUser(session.user.id);

  if (profile?.onboarding_completed) {
    redirect("/map");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-foreground">
      <UserStoreHydrator profile={profile} />
      <OnboardingWizard profile={profile} />
    </div>
  );
}
