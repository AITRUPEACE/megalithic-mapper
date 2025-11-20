import { create } from "zustand";
import type { MapViewport, ProfileRecord } from "@/lib/repos/profile-repo";

const FALLBACK_VIEWPORT: MapViewport = { latitude: 20, longitude: 0, zoom: 2 };

interface UserState {
  profile: ProfileRecord | null;
  defaultViewport: MapViewport;
  hydrateProfile: (profile: ProfileRecord | null) => void;
  setDefaultViewport: (viewport: MapViewport) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  defaultViewport: FALLBACK_VIEWPORT,
  hydrateProfile: (profile) =>
    set({
      profile,
      defaultViewport: profile?.default_viewport ?? FALLBACK_VIEWPORT,
    }),
  setDefaultViewport: (viewport) => set({ defaultViewport: viewport }),
}));
