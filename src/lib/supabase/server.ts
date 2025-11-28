import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseAnonKey, getSupabaseUrl, SUPABASE_CLIENT_OPTIONS } from "./config";

/**
 * Server-side Supabase client that works inside Next.js App Router.
 * 
 * Note: Uses async cookies() API for Next.js 15 compatibility.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
	const { cookies } = await import("next/headers");
	const cookieStore = await cookies();

	// Schema config not fully supported in @supabase/ssr types, but works at runtime
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
		...SUPABASE_CLIENT_OPTIONS,
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
				} catch {
					// setAll can throw in Server Components when cookies are immutable.
					// Middleware will refresh sessions in that case.
				}
			},
		},
	} as any);
}

export const getServerSupabaseClient = createClient;

