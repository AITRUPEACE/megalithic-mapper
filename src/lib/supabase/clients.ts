"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabaseAnonKey, getSupabaseUrl, SUPABASE_SCHEMA } from "./config";

/**
 * Browser-side Supabase client singleton.
 * Uses "megalithic" schema by default.
 *
 * ⚠️ SSR Safety: This singleton is safe because:
 * 1. File is marked "use client" - only runs in browser
 * 2. createBrowserClient() returns a stable instance
 * 3. Each browser tab gets its own instance
 *
 * ❌ DO NOT import this in Server Components - use createClient() from server.ts instead
 */
export const browserClient = createBrowserClient<Database>(
	getSupabaseUrl(),
	getSupabaseAnonKey(),
	{
		db: { schema: SUPABASE_SCHEMA },
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
			storage: typeof window !== "undefined" ? window.localStorage : undefined,
		},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any // Schema config not fully supported in types, but works at runtime
);

export function getBrowserSupabaseClient() {
	return browserClient;
}

