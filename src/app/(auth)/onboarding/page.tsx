import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { OnboardingWizard } from "./onboarding-wizard";
import { getProfileForUser } from "@/lib/supabase/profile";
import { UserStoreHydrator } from "./user-store-hydrator";

export default async function OnboardingPage() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration");
  }

  const supabase = createServerComponentClient(
    { cookies: () => cookieStore },
    { supabaseUrl, supabaseKey }
  );

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
