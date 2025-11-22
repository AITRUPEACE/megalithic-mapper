"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, MessageSquare, Images, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
		<nav className="fixed bottom-0 left-0 right-0 z-[500] border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
			<div className="flex items-center justify-around px-2 py-2">
				{mobileNavItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
								isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
							<span className="text-[10px] font-medium">{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};
