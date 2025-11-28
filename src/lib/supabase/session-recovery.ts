"use client";

/**
 * Detects and clears corrupted Supabase session data in localStorage.
 */

const SUPABASE_AUTH_KEY_PATTERN = /^sb-.*-auth-token/;

function isDoubleStringified(value: string): boolean {
	try {
		const parsed = JSON.parse(value);
		if (typeof parsed === "string" && (parsed.startsWith("{") || parsed.startsWith("["))) {
			JSON.parse(parsed);
			return true;
		}
	} catch {
		return false;
	}
	return false;
}

export function clearCorruptedSession(): boolean {
	if (typeof window === "undefined") return false;

	let foundCorrupted = false;

	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key || !SUPABASE_AUTH_KEY_PATTERN.test(key)) continue;
			const value = localStorage.getItem(key);
			if (!value) continue;
			if (isDoubleStringified(value)) {
				console.warn(`[Session Recovery] Detected corrupted session data in key: ${key}`);
				localStorage.removeItem(key);
				foundCorrupted = true;
			}
		}

		if (foundCorrupted) {
			console.log("[Session Recovery] Cleared corrupted session data. Please sign in again.");
		}
	} catch (error) {
		console.error("[Session Recovery] Error while checking for corrupted session:", error);
	}

	return foundCorrupted;
}

export function initializeSessionRecovery(): void {
	if (typeof window === "undefined") return;

	clearCorruptedSession();

	window.addEventListener("storage", (event) => {
		if (!event.key || !SUPABASE_AUTH_KEY_PATTERN.test(event.key)) {
			return;
		}

		if (event.newValue && isDoubleStringified(event.newValue)) {
			console.warn("[Session Recovery] Detected corrupted session in storage event");
			localStorage.removeItem(event.key);
		}
	});
}


