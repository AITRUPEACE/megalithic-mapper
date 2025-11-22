"use client";

import { useEffect, useState, type FocusEventHandler } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, MessageSquare, Images, BookOpen, Network, Bell, UserCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

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
	const isMapRoute = pathname.startsWith("/map");
	const [isExpanded, setIsExpanded] = useState(!isMapRoute);

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
			className={cn("relative z-40 h-full overflow-visible", isMapRoute ? "w-16 xl:w-20" : "w-64")}
			aria-expanded={isExpanded}
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
					isExpanded ? "w-64" : "w-16 xl:w-20"
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
									href={item.href}
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
						"px-4 py-4 text-xs text-muted-foreground transition-all duration-200",
						isExpanded ? "opacity-100" : "pointer-events-none opacity-0"
					)}
				>
					<p>
						Connected explorers: <span className="font-semibold text-foreground">128 online</span>
					</p>
					<p className="mt-1">
						Research projects active today: <span className="font-semibold text-foreground">6</span>
					</p>
				</div>
			</div>
		</aside>
	);
};
