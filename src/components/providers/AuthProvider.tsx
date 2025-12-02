"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/clients";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";
import { initializeSessionRecovery } from "@/lib/supabase/session-recovery";
import { isAuthenticatedClient } from "@/lib/supabase/auth-helpers";
import type { ProfileRecord } from "@/lib/supabase/profile";
import { DEFAULT_VIEWPORT } from "@/lib/supabase/profile";
import { useUserStore } from "@/entities/user/model/user-store";
import { DEV_USERS, type DevUserKey } from "@/components/dev/dev-auth-panel";

const SESSION_CHECK_TIMEOUT_MS = 5000;

/** Wraps a promise with a timeout - resolves to null on timeout instead of rejecting */
function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	fallback: T
): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
	]);
}

type AuthContextValue = {
	user: User | null;
	profile: ProfileRecord | null;
	loading: boolean;
	isAuthenticated: boolean;
	refreshUser: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type RawProfileRow = {
	expertise_tags?: string[] | null;
	default_viewport?: ProfileRecord["default_viewport"];
} & Record<string, unknown> &
	Partial<ProfileRecord>;

function normalizeProfile(row: RawProfileRow | null): ProfileRecord | null {
	if (!row) return null;
	return {
		...row,
		expertise_tags: row.expertise_tags ?? [],
		default_viewport: row.default_viewport ?? DEFAULT_VIEWPORT,
	} as ProfileRecord;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<ProfileRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const hydrateProfile = useUserStore((state) => state.hydrateProfile);

	const supabase = useMemo(() => getBrowserSupabaseClient(), []);

	const fetchProfile = useCallback(
		async (userId: string) => {
			try {
				const { data, error } = await supabase
					.schema(SUPABASE_SCHEMA)
					.from("profiles")
					.select("*")
					.eq("id", userId)
					.maybeSingle();

				if (error) {
					console.warn("Unable to fetch profile", error);
					return null;
				}

				return normalizeProfile(data);
			} catch (error) {
				console.error("Unexpected profile fetch error", error);
				return null;
			}
		},
		[supabase]
	);

	const loadUser = useCallback(async () => {
		setLoading(true);
		try {
			// Check for dev auth bypass first (development only)
			if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
				const devUserKey = document.cookie
					.split("; ")
					.find((row) => row.startsWith("dev-user-key="))
					?.split("=")[1] as DevUserKey | undefined;

				if (devUserKey && devUserKey in DEV_USERS) {
					const devUser = DEV_USERS[devUserKey];
					// Create a mock user object
					const mockUser = {
						id: devUser.id,
						email: devUser.email,
						app_metadata: {},
						user_metadata: { full_name: devUser.full_name },
						aud: "authenticated",
						created_at: new Date().toISOString(),
					} as User;
					
					// Create a mock profile
					const mockProfile: ProfileRecord = {
						id: devUser.id,
						username: devUser.username || null,
						full_name: devUser.full_name || null,
						headline: devUser.headline || null,
						bio: null,
						avatar_url: devUser.avatar_url || null,
						location: null,
						website_url: null,
						role: devUser.role,
						is_verified: devUser.is_verified,
						expertise_tags: devUser.expertise_tags || [],
						contribution_intent: null,
						collaboration_focus: null,
						notify_research_activity: true,
						notify_product_updates: false,
						onboarding_completed: devUserKey !== "newuser",
						default_viewport: DEFAULT_VIEWPORT,
					};

					console.log("🔧 Dev auth active:", devUserKey, devUser.full_name);
					setUser(mockUser);
					setProfile(mockProfile);
					hydrateProfile(mockProfile);
					setLoading(false);
					return;
				}
			}

			// Wrap getUser with timeout to prevent infinite loading
			const userResponse = await withTimeout(
				supabase.auth.getUser(),
				SESSION_CHECK_TIMEOUT_MS,
				{ data: { user: null }, error: null }
			);

			const nextUser = userResponse.data.user;
			setUser(nextUser ?? null);

			if (nextUser?.id) {
				// Also wrap profile fetch with timeout
				const nextProfile = await withTimeout(
					fetchProfile(nextUser.id),
					SESSION_CHECK_TIMEOUT_MS,
					null
				);
				setProfile(nextProfile);
				hydrateProfile(nextProfile);
			} else {
				setProfile(null);
				hydrateProfile(null);
			}
		} catch (error) {
			console.warn("Session check failed, continuing as guest:", error);
			setUser(null);
			setProfile(null);
			hydrateProfile(null);
		} finally {
			setLoading(false);
		}
	}, [fetchProfile, hydrateProfile, supabase]);

	useEffect(() => {
		initializeSessionRecovery();
		let isMounted = true;

		loadUser();

		const { data: authListener } = supabase.auth.onAuthStateChange(() => {
			if (isMounted) {
				loadUser();
			}
		});

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
	}, [loadUser, supabase]);

	const refreshUser = useCallback(async () => {
		await loadUser();
	}, [loadUser]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		await loadUser();
	}, [loadUser, supabase]);

	const value: AuthContextValue = {
		user,
		profile,
		loading,
		isAuthenticated: isAuthenticatedClient(Boolean(user)),
		refreshUser,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

