import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(raw: string | null, origin: string) {
	if (!raw) return "/map";
	if (raw.startsWith("/") && !raw.startsWith("//")) {
		return raw;
	}
	try {
		const parsed = new URL(raw, origin);
		if (parsed.origin === origin) {
			return parsed.pathname + parsed.search + parsed.hash;
		}
	} catch {
		// Ignore malformed URLs
	}
	return "/map";
}

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const next = url.searchParams.get("next");
	const errorDescription = url.searchParams.get("error_description");
	const redirectBase = url.origin;

	if (errorDescription) {
		const redirectUrl = new URL(`/login?error=${encodeURIComponent(errorDescription)}`, redirectBase);
		return NextResponse.redirect(redirectUrl);
	}

	if (!code) {
		const redirectUrl = new URL(`/login?error=missing_oauth_code`, redirectBase);
		return NextResponse.redirect(redirectUrl);
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		const redirectUrl = new URL(`/login?error=${encodeURIComponent(error.message)}`, redirectBase);
		return NextResponse.redirect(redirectUrl);
	}

	const targetPath = sanitizeNextPath(next, redirectBase);
	return NextResponse.redirect(new URL(targetPath, redirectBase));
}


