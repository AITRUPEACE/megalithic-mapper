"use client";

import { useEffect } from "react";
import type { ProfileRecord } from "@/lib/supabase/profile";
import { useUserStore } from "@/state/user-store";

export function UserStoreHydrator({ profile }: { profile: ProfileRecord | null }) {
  const hydrate = useUserStore((state) => state.hydrateProfile);

  useEffect(() => {
    hydrate(profile);
  }, [profile, hydrate]);

  return null;
}
