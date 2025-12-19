"use client";

import { useEffect, useMemo, useState, type FocusEventHandler } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Map,
	Activity,
	Search,
	MessageSquare,
	BookOpen,
	Link2,
	Bell,
	LogOut,
	Loader2,
	Plus,
	Compass,
	Users,
	Calendar,
	Library,
	Eye,
	Upload,
	Settings,
	ChevronDown,
	ChevronRight,
	Bookmark,
	History,
	Microscope,
	FileText,
	FolderOpen,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { Separator } from "@/shared/ui/separator";

// Primary action - Explore the Map
const primaryNav = [{ href: "/map", label: "Explore Map", icon: Map, isPrimary: true }];

// Activity section - What's happening
const activityNav = [
	{ href: "/activity", label: "Recent Contributions", icon: Activity },
	{ href: "/activity/following", label: "Following", icon: Eye },
	{ href: "/activity/nearby", label: "Near You", icon: Compass },
];

// Research section - Deep work
const researchNav = [
	{ href: "/research", label: "Research Projects", icon: Microscope },
	{ href: "/texts", label: "Text Library", icon: BookOpen },
	{ href: "/connections", label: "Connections", icon: Link2 },
];

// Community section
const communityNav = [
	{ href: "/forum", label: "Forum", icon: MessageSquare },
	{ href: "/events", label: "Events & Tours", icon: Calendar },
];

// My Library section
const libraryNav = [
	{ href: "/library/saved", label: "Saved Sites", icon: Bookmark },
	{ href: "/library/contributions", label: "My Contributions", icon: Upload },
	{ href: "/library/watchlist", label: "Watch List", icon: Eye },
];

interface NavSectionProps {
	title?: string;
	items: { href: string; label: string; icon: React.ElementType; isPrimary?: boolean }[];
	pathname: string;
	isExpanded: boolean;
	collapsible?: boolean;
	defaultOpen?: boolean;
}

const NavSection = ({ title, items, pathname, isExpanded, collapsible = false, defaultOpen = true }: NavSectionProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="space-y-1">
			{title && (
				<button
					onClick={() => collapsible && setIsOpen(!isOpen)}
					className={cn(
						"flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
						collapsible && "cursor-pointer hover:text-muted-foreground",
						!isExpanded && "justify-center"
					)}
				>
					{isExpanded ? (
						<>
							<span>{title}</span>
							{collapsible && (isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
						</>
					) : null}
				</button>
			)}
			{(!collapsible || isOpen) && (
				<div className="space-y-0.5">
					{items.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
									item.isPrimary
										? isActive
											? "bg-primary text-primary-foreground"
											: "bg-primary/10 text-primary hover:bg-primary/20"
										: isActive
										? "bg-secondary/70 text-foreground"
										: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
									!isExpanded && "justify-center px-2"
								)}
							>
								<Icon className={cn("h-[18px] w-[18px] shrink-0", item.isPrimary && !isActive && "text-primary")} />
								{isExpanded && <span className="flex-1 truncate">{item.label}</span>}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
};

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

	// Mock contribution count
	const contributionCount = 142;

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
			className={cn("relative h-full overflow-visible", zClass.sidebar, "hidden md:block", isMapRoute ? "w-16" : "w-60")}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			<div
				data-expanded={isExpanded}
				className={cn(
					"flex h-full flex-col overflow-hidden border-r border-border/50 bg-sidebar transition-[width] duration-300 ease-out",
					isMapRoute ? "absolute inset-y-0 left-0" : "",
					isExpanded ? "w-60" : "w-16"
				)}
			>
				{/* Logo */}
				<div className="flex h-14 items-center justify-between border-b border-border/30 px-3">
					<Link href="/map" className="flex items-center gap-2 overflow-hidden" aria-label="Megalithic Mapper">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-700">
							<Map className="h-4 w-4 text-white" />
						</div>
						{isExpanded && (
							<span className="truncate text-sm font-bold tracking-tight text-foreground">
								Megalithic<span className="text-primary">Mapper</span>
							</span>
						)}
					</Link>
				</div>

				{/* Add Contribution Button */}
				<div className="p-3">
					<Button
						asChild
						className={cn("w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold", !isExpanded && "px-0")}
						size={isExpanded ? "default" : "icon"}
					>
						<Link href="/contribute">
							<Plus className="h-4 w-4" />
							{isExpanded && <span>Add Contribution</span>}
						</Link>
					</Button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
					{/* Primary - Explore Map */}
					<NavSection items={primaryNav} pathname={pathname} isExpanded={isExpanded} />

					<Separator className="my-3 bg-border/30" />

					{/* Activity */}
					<NavSection title="Activity" items={activityNav} pathname={pathname} isExpanded={isExpanded} collapsible />

					<Separator className="my-3 bg-border/30" />

					{/* Research */}
					<NavSection title="Research" items={researchNav} pathname={pathname} isExpanded={isExpanded} collapsible />

					<Separator className="my-3 bg-border/30" />

					{/* Community */}
					<NavSection title="Community" items={communityNav} pathname={pathname} isExpanded={isExpanded} collapsible />

					<Separator className="my-3 bg-border/30" />

					{/* My Library */}
					<NavSection title="My Library" items={libraryNav} pathname={pathname} isExpanded={isExpanded} collapsible />
				</nav>

				{/* User Section */}
				<div className="border-t border-border/30 p-3">
					{isExpanded ? (
						<div className="space-y-3">
							<Link href={profileHref} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50">
								<Avatar className="h-9 w-9 border border-border/40">
									<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm">{initials}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="truncate text-sm font-medium text-foreground">{displayName}</p>
									<p className="text-xs text-muted-foreground">{contributionCount} contributions</p>
								</div>
							</Link>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
									<Link href="/profile#settings">
										<Settings className="h-3.5 w-3.5" />
										Settings
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => !isSigningOut && handleSignOut()}
									disabled={isSigningOut}
								>
									{isSigningOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
								</Button>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							<Link href={profileHref}>
								<Avatar className="h-9 w-9 border border-border/40">
									<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm">{initials}</AvatarFallback>
								</Avatar>
							</Link>
						</div>
					)}
				</div>
			</div>
		</aside>
	);
};
