import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
	getSupabaseServiceKey,
	getSupabaseUrl,
	SUPABASE_CLIENT_OPTIONS,
	SUPABASE_SERVICE_OPTIONS,
} from "./config";

/**
 * Service-role client for backend utilities (server actions, scripts, etc.).
 */
export function getServiceSupabaseClient(): SupabaseClient<Database> {
	// Schema config not fully supported in types, but works at runtime
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return createClient<Database>(getSupabaseUrl(), getSupabaseServiceKey(), {
		...SUPABASE_CLIENT_OPTIONS,
		auth: SUPABASE_SERVICE_OPTIONS.auth,
	} as any);
}

/**
 * Supabase auth admin client (operates outside schema scoping).
 */
export function getServiceAuthAdmin(): SupabaseClient<Database> {
	return createClient<Database>(getSupabaseUrl(), getSupabaseServiceKey(), {
		auth: SUPABASE_SERVICE_OPTIONS.auth,
	});
}

export function isSuperAdminEmail(email?: string | null): boolean {
	if (!email) return false;
	const raw = process.env.SUPERADMIN_EMAILS;
	if (!raw) return false;
	const allowed = raw
		.split(/[\s,;]+/)
		.map((entry) => entry.replace(/^['"]|['"]$/g, "").trim().toLowerCase())
		.filter(Boolean);
	return allowed.includes(email.toLowerCase());
}

