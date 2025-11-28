"use client";

/**
 * Client-side authentication helpers.
 */
export function isAuthenticatedClient(hasUser: boolean): boolean {
	if (hasUser) {
		return true;
	}

	if (typeof window !== "undefined") {
		const hasDevBypass = document.cookie.includes("dev-auth-bypass=true");
		if (hasDevBypass) {
			console.log("🔓 Dev auth bypass detected (client)");
			return true;
		}
	}

	return false;
}

export function getDevUserIdClient(): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	const hasDevBypass = document.cookie.includes("dev-auth-bypass=true");
	if (!hasDevBypass) {
		return null;
	}

	const match = document.cookie.match(/dev-user-id=([^;]+)/);
	return match ? match[1] : null;
}


