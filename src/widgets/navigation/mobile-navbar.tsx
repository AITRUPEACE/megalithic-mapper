"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, MessageSquare, Images, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";

const mobileNavItems = [
	{ href: "/map", label: "Map", icon: Map },
	{ href: "/discover", label: "Discover", icon: Compass },
	{ href: "/forum", label: "Forum", icon: MessageSquare },
	{ href: "/media", label: "Media", icon: Images },
	{ href: "/texts", label: "Texts", icon: BookOpen },
];

export const MobileNavbar = () => {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden",
				zClass.mobileNav
			)}
		>
			<div className="flex items-center justify-around px-1 py-1.5 sm:px-2 sm:py-2">
				{mobileNavItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors sm:gap-1 sm:py-2",
								isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
							<span className="text-[9px] font-medium sm:text-[10px]">{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};
