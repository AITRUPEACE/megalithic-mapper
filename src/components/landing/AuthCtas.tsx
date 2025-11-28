"use client";

import Link from "next/link";
import { Loader2, Map } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

export function AuthCtas() {
	const { isAuthenticated, loading } = useAuth();

	const primaryHref = isAuthenticated ? "/map" : "/login";
	const primaryLabel = isAuthenticated ? "Go to collaborative map" : "Sign in to start mapping";
	const secondaryHref = "/research";
	const secondaryLabel = isAuthenticated ? "Explore research projects" : "Preview research projects";

	return (
		<div className="flex flex-wrap gap-4">
			<Button asChild size="lg" className="min-w-[220px]">
				<Link href={primaryHref}>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Checking session…
						</>
					) : (
						<>
							<Map className="mr-2 h-4 w-4" />
							{primaryLabel}
						</>
					)}
				</Link>
			</Button>
			<Button asChild variant="secondary" size="lg" className="min-w-[220px]">
				<Link href={secondaryHref}>{secondaryLabel}</Link>
			</Button>
		</div>
	);
}


