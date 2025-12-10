"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Activity, Plus, MessageSquare } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

const mobileNavItems = [
	{ href: "/map", label: "Map", icon: Map },
	{ href: "/activity", label: "Activity", icon: Activity },
	{ href: "/contribute", label: "Add", icon: Plus, isAction: true },
	{ href: "/forum", label: "Forum", icon: MessageSquare },
];

export const MobileNavbar = () => {
	const pathname = usePathname();
	const { profile, user } = useAuth();

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

	// Hide mobile nav on map page - map has its own specialized navigation
	const isMapPage = pathname === "/map" || pathname.startsWith("/map/");
	if (isMapPage) return null;

	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 border-t border-border/40 bg-card/95 pb-safe backdrop-blur-lg md:hidden",
				zClass.mobileNav
			)}
		>
			<div className="flex items-center justify-around px-2 py-1.5">
				{mobileNavItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

					if (item.isAction) {
						return (
							<Link
								key={item.href}
								href={item.href}
								className="flex flex-col items-center justify-center rounded-full bg-primary p-2.5 -mt-4 shadow-lg shadow-black/30"
							>
								<Icon className="h-5 w-5 text-primary-foreground" />
							</Link>
						);
					}

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
								isActive ? "text-primary" : "text-muted-foreground"
							)}
						>
							<Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
							<span className="text-[10px] font-medium">{item.label}</span>
						</Link>
					);
				})}
				{/* Profile link */}
				<Link
					href={profileHref}
					className={cn(
						"flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
						pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
					)}
				>
					<Avatar className="h-5 w-5 border border-border/40">
						<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-[8px]">
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className="text-[10px] font-medium">Profile</span>
				</Link>
			</div>
		</nav>
	);
};
