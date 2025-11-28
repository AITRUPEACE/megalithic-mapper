/**
 * Centralized Supabase configuration for the Megalithic schema.
 */

export const SUPABASE_SCHEMA = "megalithic" as const;

export function getSupabaseUrl(): string {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (!url) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
	}
	return url;
}

export function getSupabaseAnonKey(): string {
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!key) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
	}
	return key;
}

export function getSupabaseServiceKey(): string {
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;
	if (!key) {
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
	}
	return key;
}

// Common Supabase client options
export const SUPABASE_CLIENT_OPTIONS = {
	db: { schema: SUPABASE_SCHEMA },
} as const;

export const SUPABASE_SERVICE_OPTIONS = {
	db: { schema: SUPABASE_SCHEMA },
	auth: { persistSession: false, autoRefreshToken: false },
} as const;

