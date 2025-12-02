import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, SUPABASE_CLIENT_OPTIONS } from "@/lib/supabase/config";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback", "/favicon.ico"];
const PROTECTED_PREFIXES = [
	"/map",
	"/discover",
	"/forum",
	"/media",
	"/notifications",
	"/profile",
	"/research",
	"/texts",
	"/content",
	"/browse",
	"/app",
	"/auth/onboarding",
];

const isProtectedPath = (pathname: string) => {
	return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const isPublicPath = (pathname: string) => {
	return PUBLIC_PATHS.includes(pathname);
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (
		isPublicPath(pathname) ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/static") ||
		pathname.startsWith("/api")
	) {
		return NextResponse.next();
	}

	if (!isProtectedPath(pathname)) {
		return NextResponse.next();
	}

	// Check for dev auth bypass (development only)
	const devAuthBypass = request.cookies.get("dev-auth-bypass")?.value;
	if (process.env.NODE_ENV === "development" && devAuthBypass === "true") {
		console.log("🔧 Dev auth bypass active for:", pathname);
		return NextResponse.next();
	}

	const response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	// Schema config not fully supported in @supabase/ssr types, but works at runtime
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const supabase = createServerClient(
		getSupabaseUrl(),
		getSupabaseAnonKey(),
		{
			...SUPABASE_CLIENT_OPTIONS,
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					response.cookies.set({ name, value, ...options });
				},
				remove(name: string, options: CookieOptions) {
					response.cookies.delete({ name, ...options });
				},
			},
		} as any
	);

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error && typeof error.status === "number" && error.status >= 500) {
		// Treat Supabase outages as soft failures so we don't boot users unnecessarily.
		return response;
	}

	if (!user) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = "/login";
		redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
		return NextResponse.redirect(redirectUrl);
	}

	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

