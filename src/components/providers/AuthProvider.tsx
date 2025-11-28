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
			const {
				data: { user: nextUser },
			} = await supabase.auth.getUser();

			setUser(nextUser ?? null);

			if (nextUser?.id) {
				const nextProfile = await fetchProfile(nextUser.id);
				setProfile(nextProfile);
				hydrateProfile(nextProfile);
			} else {
				setProfile(null);
				hydrateProfile(null);
			}
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

