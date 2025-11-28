import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getServerSupabaseClient } from "./server";

type UserRole = "user" | "contributor" | "researcher" | "expert" | "admin";
type AllowedRoles = Array<UserRole>;

type AuthorizationOk<T> = {
	ok: true;
	user: User;
	userRole: UserRole;
	entity: T;
};

type AuthorizationError = { ok: false; response: NextResponse };

type SiteRecord = { id: string; layer: string; updated_by: string | null };

/**
 * Get authenticated user from server.
 * Uses getUser() which verifies the JWT with Supabase (secure for server-side).
 * DO NOT use getSession() on the server - it doesn't verify the token.
 */
async function getAuthenticatedUser(): Promise<User | null> {
	const supabase = await getServerSupabaseClient();
	const { data: { user }, error } = await supabase.auth.getUser();
	
	if (error) {
		console.error("Auth verification error:", error.message);
		return null;
	}
	
	return user;
}

async function getUserRole(userId: string): Promise<UserRole> {
	const supabase = await getServerSupabaseClient();
	// Client already configured with megalithic schema via SUPABASE_CLIENT_OPTIONS
	const { data } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", userId)
		.maybeSingle<{ role: UserRole }>();

	return data?.role ?? "user";
}

async function fetchSite(siteId: string): Promise<SiteRecord | null> {
	const supabase = await getServerSupabaseClient();
	// Client already configured with megalithic schema via SUPABASE_CLIENT_OPTIONS
	const { data } = await supabase
		.from("sites")
		.select("id, layer, updated_by")
		.eq("id", siteId)
		.maybeSingle<SiteRecord>();

	return data ?? null;
}

export async function authorizeSiteEdit(
	siteId: string,
	allowedRoles: AllowedRoles = ["admin", "expert", "researcher"]
): Promise<AuthorizationOk<SiteRecord> | AuthorizationError> {
	const user = await getAuthenticatedUser();
	if (!user) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	const site = await fetchSite(siteId);
	if (!site) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Site not found" }, { status: 404 }),
		};
	}

	const userRole = await getUserRole(user.id);
	const isAllowedRole = allowedRoles.includes(userRole);
	const isSiteOwner = site.updated_by === user.id;

	if (!isAllowedRole && !isSiteOwner) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
		};
	}

	return { ok: true, user, userRole, entity: site };
}

export async function authorizeRoleAccess(
	allowedRoles: AllowedRoles = ["admin"]
): Promise<AuthorizationOk<{ role: UserRole }> | AuthorizationError> {
	const user = await getAuthenticatedUser();
	if (!user) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	const userRole = await getUserRole(user.id);
	if (!allowedRoles.includes(userRole)) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
		};
	}

	return { ok: true, user, userRole, entity: { role: userRole } };
}
