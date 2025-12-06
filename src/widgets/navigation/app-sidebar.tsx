"use client";

import { useEffect, useMemo, useState, type FocusEventHandler } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Map, Compass, MessageSquare, Images, BookOpen, Network, Bell, UserCircle, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
	{ href: "/map", label: "Map", icon: Map },
	{ href: "/discover", label: "Discover", icon: Compass },
	{ href: "/forum", label: "Forum", icon: MessageSquare },
	{ href: "/media", label: "Media", icon: Images },
	{ href: "/texts", label: "Text Library", icon: BookOpen },
	{ href: "/research", label: "Research Hub", icon: Network },
	{ href: "/notifications", label: "Notifications", icon: Bell },
	{ href: "/profile", label: "Profile", icon: UserCircle },
];

export const AppSidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const isMapRoute = pathname.startsWith("/map");
	const [isExpanded, setIsExpanded] = useState(!isMapRoute);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const { profile, user, signOut } = useAuth();

	const profileHref = profile?.username ? `/profile/${profile.username}` : "/profile";
	const initials = useMemo(() => {
		const source = profile?.full_name ?? user?.email ?? "MM";
		return source
			.split(/\s+/)
			.map((part) => part[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}, [profile?.full_name, user?.email]);
	const displayName = profile?.full_name ?? profile?.username ?? user?.email ?? "Explorer";

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await signOut();
			router.replace("/login");
		} finally {
			setIsSigningOut(false);
		}
	};

	useEffect(() => {
		setIsExpanded(!isMapRoute);
	}, [isMapRoute]);

	const handleMouseEnter = () => {
		if (isMapRoute) {
			setIsExpanded(true);
		}
	};

	const handleMouseLeave = () => {
		if (isMapRoute) {
			setIsExpanded(false);
		}
	};

	const handleFocus = () => {
		if (isMapRoute) {
			setIsExpanded(true);
		}
	};

	const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
		if (!isMapRoute) return;
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsExpanded(false);
		}
	};

	return (
		<aside
			className={cn(
				"relative h-full overflow-visible",
				zClass.sidebar,
				"hidden md:block", // Hide on mobile
				isMapRoute ? "w-16" : "w-64"
			)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			<div
				data-expanded={isExpanded}
				className={cn(
					"flex h-full flex-col overflow-hidden border-r border-border/60 bg-background/60 backdrop-blur transition-[width] duration-300 ease-out",
					isMapRoute ? "absolute inset-y-0 left-0" : "",
					isExpanded ? "w-64" : "w-16 xl:w-16"
				)}
			>
				<div className={cn("flex h-16 min-w-0 items-center gap-2 px-4 transition-all duration-200", "justify-start")}>
					<Link href="/map" className="flex min-w-0 items-center gap-2 overflow-hidden text-lg font-semibold" aria-label="Megalithic Mapper">
						<Map className="h-5 w-5 shrink-0 text-primary" />
						<span
							className={cn(
								"min-w-0 truncate text-xs uppercase tracking-wide text-primary transition-opacity duration-200",
								isExpanded ? "opacity-100" : "opacity-0"
							)}
						>
							Megalithic Mapper
						</span>
					</Link>
				</div>
				<nav className={cn("flex flex-1 flex-col overflow-hidden transition-all duration-200", isExpanded ? "gap-1.5 px-3 py-3" : "gap-1 px-3 py-3")}>
					{navItems.map((item) => {
						const Icon = item.icon;
						const targetHref = item.href === "/profile" ? profileHref : item.href;
						const isActive = pathname.startsWith(item.href);
						return (
							<Button
								key={item.href}
								asChild
								variant={isActive ? "secondary" : "ghost"}
								size={isExpanded ? "sm" : "icon"}
								className={cn(
									"transition-all duration-200",
									"w-full justify-start gap-2 rounded-md",
									!isExpanded && "pl-3",
									isActive && (isExpanded ? "bg-secondary/70" : "bg-secondary/40")
								)}
							>
								<Link
									href={targetHref}
									className={cn("flex min-w-0 items-center overflow-hidden", isExpanded ? "w-full gap-2" : "w-full")}
									aria-label={item.label}
								>
									<Icon className="h-4 w-4 shrink-0" />
									<span
										className={cn("min-w-0 truncate text-sm font-medium transition-opacity duration-200", isExpanded ? "opacity-100" : "opacity-0")}
									>
										{item.label}
									</span>
								</Link>
							</Button>
						);
					})}
				</nav>
				<div
					className={cn(
						"flex items-center gap-3 border-t border-border/40 px-4 py-4 text-xs text-muted-foreground transition-all duration-200",
						isExpanded ? "opacity-100" : "pointer-events-none opacity-0"
					)}
				>
					<Avatar className="h-10 w-10">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="flex flex-1 flex-col">
						<Link href={profileHref} className="text-sm font-semibold text-foreground">
							{displayName}
						</Link>
						<Button
							variant="ghost"
							size="sm"
							className="h-auto justify-start gap-2 px-0 text-xs text-muted-foreground hover:text-destructive"
							onClick={() => {
								if (!isSigningOut) {
									handleSignOut();
								}
							}}
						>
							{isSigningOut ? (
								<>
									<Loader2 className="h-3 w-3 animate-spin" />
									Signing out…
								</>
							) : (
								<>
									<LogOut className="h-3 w-3" />
									Sign out
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</aside>
	);
};
