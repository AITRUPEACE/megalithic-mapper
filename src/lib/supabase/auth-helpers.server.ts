import { cookies } from "next/headers";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Server-side authentication helpers.
 * 
 * IMPORTANT: For server-side auth checks, prefer using supabase.auth.getUser()
 * directly as it verifies the JWT. These helpers are mainly for dev bypass support.
 */

/**
 * @deprecated Use getUser() instead of getSession() for server-side auth.
 * This function is kept for backward compatibility with dev bypass.
 */
export async function isAuthenticated(session: Session | null): Promise<boolean> {
	if (session) {
		return true;
	}

	if (process.env.NODE_ENV !== "production") {
		const cookieStore = await cookies();
		const devBypass = cookieStore.get("dev-auth-bypass")?.value === "true";
		if (devBypass) {
			console.log("🔓 Dev auth bypass detected");
			return true;
		}
	}

	return false;
}

/**
 * Check if user is authenticated (using User object from getUser()).
 * Also supports dev bypass in non-production environments.
 */
export async function isUserAuthenticated(user: User | null): Promise<boolean> {
	if (user) {
		return true;
	}

	if (process.env.NODE_ENV !== "production") {
		const cookieStore = await cookies();
		const devBypass = cookieStore.get("dev-auth-bypass")?.value === "true";
		if (devBypass) {
			console.log("🔓 Dev auth bypass detected");
			return true;
		}
	}

	return false;
}

export async function getDevUserId(): Promise<string | null> {
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	const cookieStore = await cookies();
	const devBypass = cookieStore.get("dev-auth-bypass")?.value === "true";

	if (devBypass) {
		const userId = cookieStore.get("dev-user-id")?.value;
		return userId ?? null;
	}

	return null;
}


