import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";
import { getProfileForUser } from "@/lib/supabase/profile";
import { UserStoreHydrator } from "./user-store-hydrator";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
	const supabase = await createClient();

	// Use getUser() for secure server-side auth verification
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/");
	}

	const profile = await getProfileForUser(user.id);

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
