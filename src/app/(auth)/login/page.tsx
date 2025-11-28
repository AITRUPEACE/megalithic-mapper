"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Globe, Send } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { getBrowserSupabaseClient } from "@/lib/supabase/clients";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";
import { useAuth } from "@/components/providers/AuthProvider";

const getAppUrl = () => {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.NEXT_PUBLIC_APP_URL ?? "";
};

const sanitizeNext = (raw: string | null) => {
	if (!raw) return "/map";
	if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
	try {
		const parsed = new URL(raw, getAppUrl() || "http://localhost:3000");
		return parsed.pathname + parsed.search + parsed.hash;
	} catch {
		return "/map";
	}
};

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const supabase = useMemo(() => getBrowserSupabaseClient(), []);
	const nextParam = searchParams.get("next");
	const nextPath = useMemo(() => sanitizeNext(nextParam), [nextParam]);

	const { isAuthenticated, loading: authLoading, profile, refreshUser } = useAuth();

	const [passwordEmail, setPasswordEmail] = useState("");
	const [password, setPassword] = useState("");
	const [magicEmail, setMagicEmail] = useState("");

	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [magicMessage, setMagicMessage] = useState<string | null>(null);
	const [magicError, setMagicError] = useState<string | null>(null);
	const [generalError, setGeneralError] = useState<string | null>(null);

	const [isPasswordLoading, setIsPasswordLoading] = useState(false);
	const [isMagicLoading, setIsMagicLoading] = useState(false);
	const [isOAuthLoading, setIsOAuthLoading] = useState(false);

	useEffect(() => {
		if (authLoading) return;
		if (isAuthenticated) {
			if (profile?.username) {
				router.replace(nextPath);
			} else {
				router.replace("/auth/onboarding");
			}
		}
	}, [authLoading, isAuthenticated, profile, nextPath, router]);

	const redirectAfterAuth = useCallback(async () => {
		await refreshUser();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return;
		}

		const { data } = await supabase
			.schema(SUPABASE_SCHEMA)
			.from("profiles")
			.select("username")
			.eq("id", user.id)
			.maybeSingle<{ username: string | null }>();

		if (!data?.username) {
			router.replace("/auth/onboarding");
			return;
		}

		router.replace(nextPath);
	}, [nextPath, refreshUser, router, supabase]);

	const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPasswordError(null);
		setGeneralError(null);
		setIsPasswordLoading(true);
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: passwordEmail,
				password,
			});
			if (error) {
				setPasswordError(error.message);
				return;
			}
			await redirectAfterAuth();
		} catch (error) {
			console.error(error);
			setGeneralError("We couldn't sign you in. Please try again.");
		} finally {
			setIsPasswordLoading(false);
		}
	};

	const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setMagicMessage(null);
		setMagicError(null);
		setIsMagicLoading(true);

		try {
			const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
			const { error } = await supabase.auth.signInWithOtp({
				email: magicEmail,
				options: { emailRedirectTo: redirectTo },
			});
			if (error) {
				setMagicError(error.message);
				return;
			}
			setMagicMessage("Magic link sent! Check your inbox to continue.");
		} catch (error) {
			console.error(error);
			setMagicError("Unable to send magic link right now. Please try again later.");
		} finally {
			setIsMagicLoading(false);
		}
	};

	const handleGoogle = async () => {
		setGeneralError(null);
		setIsOAuthLoading(true);
		try {
			const redirectTo = `${getAppUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo },
			});
			if (error) {
				setGeneralError(error.message);
				setIsOAuthLoading(false);
			}
		} catch (error) {
			console.error(error);
			setGeneralError("Google sign-in is unavailable. Please try another method.");
			setIsOAuthLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-2">
				<section className="space-y-6">
					<div className="space-y-3">
						<p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
							<ShieldCheck className="h-4 w-4" />
							Verified research network
						</p>
						<h1 className="text-4xl font-semibold">Sign in to Megalithic Mapper</h1>
						<p className="text-muted-foreground">
							Continue mapping ancient engineering, coordinating expeditions, and debating hypotheses with the community.
						</p>
					</div>
					<Card className="border-border/40 bg-background/60">
						<CardHeader>
							<CardTitle>Email & password</CardTitle>
							<CardDescription>Trusted contributors can sign in with their Supabase account credentials.</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="space-y-4" onSubmit={handlePasswordSignIn}>
								<div className="space-y-2">
									<Label htmlFor="password-email">Email address</Label>
									<div className="relative">
										<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="password-email"
											type="email"
											autoComplete="email"
											required
											value={passwordEmail}
											onChange={(event) => setPasswordEmail(event.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="password"
											type="password"
											autoComplete="current-password"
											required
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								{passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
								<Button type="submit" className="w-full" disabled={isPasswordLoading}>
									{isPasswordLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Signing in…
										</>
									) : (
										<>
											Access workspace
											<ArrowRight className="ml-2 h-4 w-4" />
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card className="border-border/40 bg-background/60">
						<CardHeader>
							<CardTitle>Magic link</CardTitle>
							<CardDescription>We’ll email you a secure link that signs you in instantly.</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="space-y-4" onSubmit={handleMagicLink}>
								<div className="space-y-2">
									<Label htmlFor="magic-email">Email address</Label>
									<div className="relative">
										<Send className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="magic-email"
											type="email"
											required
											value={magicEmail}
											onChange={(event) => setMagicEmail(event.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								{magicMessage && <p className="text-sm text-emerald-400">{magicMessage}</p>}
								{magicError && <p className="text-sm text-destructive">{magicError}</p>}
								<Button type="submit" variant="secondary" className="w-full" disabled={isMagicLoading}>
									{isMagicLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending…
										</>
									) : (
										<>
											Send magic link
											<ArrowRight className="ml-2 h-4 w-4" />
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</section>

				<section className="space-y-6 rounded-2xl border border-border/40 bg-gradient-to-b from-slate-950/60 to-slate-900/40 p-8">
					<div className="space-y-4">
						<h2 className="text-2xl font-semibold">Federated sign-in</h2>
						<p className="text-muted-foreground">
							Use your Google identity to join map edits, contribute research dossiers, and collaborate on expedition planning.
						</p>
						<Button
							type="button"
							variant="outline"
							className="w-full border-primary/40 text-primary"
							onClick={handleGoogle}
							disabled={isOAuthLoading}
						>
							{isOAuthLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Redirecting to Google…
								</>
							) : (
								<>
									<Globe className="mr-2 h-4 w-4" />
									Continue with Google
								</>
							)}
						</Button>
					</div>

					<div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-sm text-primary">
						<p className="font-semibold">Session Security</p>
						<p className="text-primary/90">
							All methods flow through Supabase Auth, refresh automatically, and respect the Megalithic schema row-level security rules.
						</p>
					</div>

					{generalError && <p className="text-sm text-destructive">{generalError}</p>}

					<div className="text-sm text-muted-foreground">
						<p>Problems accessing your account?</p>
						<p>
							Email{" "}
							<a className="text-primary underline" href="mailto:support@megalithicmapper.com">
								support@megalithicmapper.com
							</a>{" "}
							and we’ll help you get back on the map.
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
