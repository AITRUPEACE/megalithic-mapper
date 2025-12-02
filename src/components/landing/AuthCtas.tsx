"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { getBrowserSupabaseClient } from "@/lib/supabase/clients";

const getAppUrl = () => {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.NEXT_PUBLIC_APP_URL ?? "";
};

type AuthCtasProps = {
	variant?: "default" | "compact";
};

export function AuthCtas({ variant = "default" }: AuthCtasProps) {
	const router = useRouter();
	const { isAuthenticated, loading } = useAuth();
	const supabase = useMemo(() => getBrowserSupabaseClient(), []);
	const [isOAuthLoading, setIsOAuthLoading] = useState(false);

	// Auto-redirect authenticated users
	useEffect(() => {
		if (!loading && isAuthenticated) {
			router.push("/map");
		}
	}, [loading, isAuthenticated, router]);

	const handleGoogleSignIn = async () => {
		setIsOAuthLoading(true);
		try {
			const appUrl = getAppUrl();
			const redirectTo = `${appUrl}/auth/callback?next=/map`;
			console.log("🔍 OAuth Debug:", { appUrl, redirectTo, windowOrigin: window.location.origin });
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo },
			});
			if (error) {
				console.error("OAuth error:", error);
				setIsOAuthLoading(false);
			}
		} catch (error) {
			console.error("Google sign-in failed:", error);
			setIsOAuthLoading(false);
		}
	};

	// User is authenticated - just show map access
	if (!loading && isAuthenticated) {
		return (
			<div className="flex flex-col items-center gap-3 sm:flex-row">
				<Button asChild size="lg" className="group gap-2">
					<Link href="/map">
						<Map className="h-4 w-4" />
						Open the Map
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</Button>
			</div>
		);
	}

	// Compact variant for bottom CTA
	if (variant === "compact") {
		return (
			<div className="flex flex-col items-center gap-3 sm:flex-row">
				<Button
					size="lg"
					className="gap-2 bg-white text-slate-900 hover:bg-white/90"
					onClick={handleGoogleSignIn}
					disabled={isOAuthLoading}
				>
					{isOAuthLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<GoogleIcon className="h-4 w-4" />
					)}
					{isOAuthLoading ? "Connecting..." : "Jump in with Google"}
				</Button>
				<span className="text-sm text-muted-foreground">or</span>
				<Button
					asChild
					variant="ghost"
					size="lg"
					className="text-muted-foreground hover:text-foreground"
				>
					<Link href="/map">
						just browse around
						<ArrowRight className="ml-1 h-4 w-4" />
					</Link>
				</Button>
			</div>
		);
	}

	// Default: main hero CTA
	return (
		<div className="flex flex-col items-center gap-4">
			<Button
				size="lg"
				className="h-12 gap-3 bg-white px-6 text-base text-slate-900 shadow-lg shadow-white/5 hover:bg-white/90"
				onClick={handleGoogleSignIn}
				disabled={isOAuthLoading}
			>
				{isOAuthLoading ? (
					<Loader2 className="h-5 w-5 animate-spin" />
				) : (
					<GoogleIcon className="h-5 w-5" />
				)}
				{isOAuthLoading ? "Connecting..." : "Join with Google"}
			</Button>
			
			<div className="flex items-center gap-4 text-sm">
				<Link 
					href="/login" 
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					Sign in with email
				</Link>
				<span className="text-muted-foreground/40">·</span>
				<Link 
					href="/map" 
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					Explore as guest
				</Link>
			</div>
		</div>
	);
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}
