"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Search,
	Plus,
	ShieldCheck,
	Menu,
	UserCircle,
	Bell,
	Settings,
	LogOut,
	Network,
	Map,
	Compass,
	MessageSquare,
	Images,
	BookOpen,
	Loader2,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import { useAuth } from "@/components/providers/AuthProvider";

interface AppTopbarProps {
	onGlobalSearch?: (query: string) => void;
}

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

export const AppTopbar = ({ onGlobalSearch }: AppTopbarProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const { profile, user, loading: authLoading, signOut } = useAuth();

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
	const email = user?.email ?? profile?.username ?? "authenticated";

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await signOut();
			router.replace("/login");
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<header
			className={cn(
				"relative flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/50 px-3 backdrop-blur sm:h-16 sm:px-4 md:px-6",
				zClass.topbar
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
				{/* Mobile menu button */}
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="shrink-0 md:hidden">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[280px]">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-2">
								<Map className="h-5 w-5 text-primary" />
								<span className="text-sm uppercase tracking-wide text-primary">Megalithic Mapper</span>
							</SheetTitle>
						</SheetHeader>
						<nav className="mt-6 flex flex-col gap-2">
							{navItems.map((item) => {
								const Icon = item.icon;
								const targetHref = item.href === "/profile" ? profileHref : item.href;
								const isActive = pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={targetHref}
										onClick={() => setIsSheetOpen(false)}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
											isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
										)}
									>
										<Icon className="h-4 w-4" />
										{item.label}
									</Link>
								);
							})}
						</nav>
						<div className="absolute bottom-4 left-4 right-4 space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
							<p>
								Connected explorers: <span className="font-semibold text-foreground">128 online</span>
							</p>
							<p>
								Research projects active today: <span className="font-semibold text-foreground">6</span>
							</p>
						</div>
					</SheetContent>
				</Sheet>

				{/* Desktop Research Hub link */}
				<Link
					href="/research"
					className={cn(
						"hidden items-center gap-1 rounded-md border border-primary/30 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary md:inline-flex",
						pathname.startsWith("/research") && "bg-primary/10"
					)}
				>
					Research Hub
				</Link>

				{/* Mobile search button */}
				<Button variant="ghost" size="icon" className="md:hidden">
					<Search className="h-5 w-5" />
					<span className="sr-only">Search</span>
				</Button>
			</div>

			<div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
				{/* New Contribution button */}
				<Button asChild size="sm" variant="secondary" className="hidden md:flex">
					<Link href="/map#new-site">
						<Plus className="mr-1 h-4 w-4" />
						New Contribution
					</Link>
				</Button>

				{/* Mobile compact version */}
				<Button asChild size="icon" variant="secondary" className="h-8 w-8 md:hidden">
					<Link href="/map#new-site">
						<Plus className="h-4 w-4" />
					</Link>
				</Button>

				{/* Desktop search */}
				<div className="relative hidden w-[200px] lg:block">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search the platform..."
						className="h-8 w-full rounded-full border-border/40 bg-background/70 pl-9 text-xs"
						onChange={(event) => onGlobalSearch?.(event.target.value)}
					/>
				</div>

				{/* Desktop verification button */}
				<Button asChild size="sm" variant="ghost" className="hidden lg:flex">
					<Link href={profileHref}>
						<ShieldCheck className="mr-1 h-4 w-4" />
						Request Verification
					</Link>
				</Button>

				{/* Notifications button - mobile and desktop */}
				<Button asChild variant="ghost" size="icon" className="hidden md:flex">
					<Link href="/notifications">
						<Bell className="h-4 w-4" />
						<span className="sr-only">Notifications</span>
					</Link>
				</Button>

				{/* Profile dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="relative h-8 w-8 rounded-full">
							<Avatar className="h-8 w-8">
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="end" forceMount>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">{authLoading ? "Loading profile…" : displayName}</p>
								<p className="text-xs leading-none text-muted-foreground">{email}</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href={profileHref} className="cursor-pointer">
								<UserCircle className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="md:hidden">
							<Link href="/notifications" className="cursor-pointer">
								<Bell className="mr-2 h-4 w-4" />
								<span>Notifications</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="lg:hidden">
							<Link href={profileHref} className="cursor-pointer">
								<ShieldCheck className="mr-2 h-4 w-4" />
								<span>Request Verification</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/profile#settings" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="cursor-pointer text-destructive"
							onSelect={(event) => {
								event.preventDefault();
								if (!isSigningOut) {
									handleSignOut();
								}
							}}
						>
							{isSigningOut ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span>Signing out…</span>
								</>
							) : (
								<>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
};
