"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Search,
	Menu,
	Bell,
	Settings,
	LogOut,
	Map,
	Activity,
	MessageSquare,
	BookOpen,
	Link2,
	Loader2,
	Command,
	Upload,
	UserCircle,
	Compass,
	Microscope,
	Calendar,
	Library,
	Eye,
	CheckCircle2,
	AtSign,
	ShieldCheck,
	FlaskConical,
	MessageCircle,
	ExternalLink,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { cn, timeAgo } from "@/shared/lib/utils";
import { zClass } from "@/shared/lib/z-index";
import { useAuth } from "@/components/providers/AuthProvider";
import { Separator } from "@/shared/ui/separator";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { sampleNotifications } from "@/shared/mocks/sample-notifications";

// Notification type icons
const notificationTypeIcons: Record<string, React.ElementType> = {
	mention: AtSign,
	verification: ShieldCheck,
	research_update: FlaskConical,
	comment: MessageCircle,
	system: Bell,
};

interface AppTopbarProps {
	onGlobalSearch?: (query: string) => void;
}

// Mobile navigation items
const mobileNavItems = [
	{ href: "/map", label: "Explore Map", icon: Map, primary: true },
	{ href: "/activity", label: "Recent Activity", icon: Activity },
	{ href: "/research", label: "Research Projects", icon: Microscope },
	{ href: "/texts", label: "Text Library", icon: BookOpen },
	{ href: "/connections", label: "Connections", icon: Link2 },
	{ href: "/forum", label: "Forum", icon: MessageSquare },
	{ href: "/events", label: "Events & Tours", icon: Calendar },
	{ href: "/notifications", label: "Notifications", icon: Bell },
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

	// Mock data
	const unreadNotifications = 3;
	const contributionCount = 142;
	const isVerified = true;

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
		<header className={cn("relative flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-card px-3 sm:px-4 md:px-5", zClass.topbar)}>
			{/* Left Section: Mobile Menu + Search */}
			<div className="flex flex-1 items-center gap-3">
				{/* Mobile menu button */}
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="shrink-0 md:hidden">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[280px] bg-[#0e1217] border-border/40">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-700">
									<Map className="h-4 w-4 text-white" />
								</div>
								<span className="text-sm font-bold">
									Megalithic<span className="text-primary">Mapper</span>
								</span>
							</SheetTitle>
						</SheetHeader>
						<div className="mt-4">
							<Button asChild className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
								<Link href="/contribute" onClick={() => setIsSheetOpen(false)}>
									<Upload className="h-4 w-4" />
									Add Contribution
								</Link>
							</Button>
						</div>
						<nav className="mt-6 flex flex-col gap-1">
							{mobileNavItems.map((item) => {
								const Icon = item.icon;
								const isActive = pathname.startsWith(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsSheetOpen(false)}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
											item.primary
												? isActive
													? "bg-primary text-primary-foreground"
													: "bg-primary/10 text-primary"
												: isActive
												? "bg-secondary text-foreground"
												: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
										)}
									>
										<Icon className="h-[18px] w-[18px]" />
										{item.label}
									</Link>
								);
							})}
						</nav>
						<Separator className="my-4 bg-border/30" />
						<div className="space-y-2 text-xs text-muted-foreground">
							<p>
								Sites documented: <span className="font-semibold text-foreground">2,847</span>
							</p>
							<p>
								Active researchers: <span className="font-semibold text-foreground">128 online</span>
							</p>
						</div>
					</SheetContent>
				</Sheet>

				{/* Search Bar */}
				<div className="relative w-full max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search sites, media, researchers..."
						className="h-9 w-full rounded-xl border-border/40 bg-secondary/30 pl-9 pr-12 text-sm placeholder:text-muted-foreground/60 focus:bg-secondary/50 focus:ring-1 focus:ring-primary/30"
						onChange={(event) => onGlobalSearch?.(event.target.value)}
					/>
					<kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
						<Command className="h-2.5 w-2.5" />
						<span>K</span>
					</kbd>
				</div>
			</div>

			{/* Right Section: Actions */}
			<div className="flex items-center gap-2">
				{/* Contribution Count - Desktop only */}
				<Link
					href="/library/contributions"
					className="hidden sm:flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1.5 hover:bg-secondary/50 transition-colors"
				>
					<Upload className="h-4 w-4 text-primary" />
					<span className="text-sm font-semibold text-foreground">{contributionCount}</span>
				</Link>

				{/* Theme Toggle - Desktop only */}
				<div className="hidden sm:block">
					<ThemeToggle />
				</div>

				{/* Notifications Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
						>
							<Bell className="h-4 w-4" />
							{unreadNotifications > 0 && (
								<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
									{unreadNotifications}
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-80 bg-[#1a1f26] border-border/40" align="end" forceMount>
						<DropdownMenuLabel className="flex items-center justify-between">
							<span className="font-semibold">Notifications</span>
							{unreadNotifications > 0 && (
								<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
									{unreadNotifications} new
								</Badge>
							)}
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="bg-border/30" />
						<div className="max-h-[320px] overflow-y-auto">
							{sampleNotifications.slice(0, 5).map((notification) => {
								const TypeIcon = notificationTypeIcons[notification.type] || Bell;
								return (
									<DropdownMenuItem
										key={notification.id}
										className={cn("flex flex-col items-start gap-1 p-3 cursor-pointer", notification.unread && "bg-primary/5")}
										asChild
									>
										<Link href={notification.link?.href ?? "/notifications"}>
											<div className="flex items-start gap-2.5 w-full">
												<div
													className={cn(
														"flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
														notification.unread ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
													)}
												>
													<TypeIcon className="h-4 w-4" />
												</div>
												<div className="flex-1 min-w-0">
													<p className={cn("text-sm leading-snug", notification.unread ? "text-foreground" : "text-muted-foreground")}>
														{notification.summary}
													</p>
													<div className="flex items-center gap-2 mt-1">
														<span className="text-[10px] text-muted-foreground">{timeAgo(notification.timestamp)}</span>
														{notification.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
													</div>
												</div>
											</div>
										</Link>
									</DropdownMenuItem>
								);
							})}
						</div>
						<DropdownMenuSeparator className="bg-border/30" />
						<DropdownMenuItem asChild className="justify-center">
							<Link href="/notifications" className="w-full text-center cursor-pointer py-2">
								<span className="text-sm text-primary font-medium">See all notifications</span>
								<ExternalLink className="ml-1.5 h-3 w-3 text-primary" />
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Profile dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/30">
							<Avatar className="h-8 w-8 border border-border/40">
								<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-semibold">{initials}</AvatarFallback>
							</Avatar>
							{isVerified && (
								<CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-blue-400 fill-blue-400 bg-[#0e1217] rounded-full" />
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-60 bg-[#1a1f26] border-border/40" align="end" forceMount>
						<DropdownMenuLabel className="font-normal">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10 border border-border/40">
									<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">{initials}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col space-y-0.5">
									<div className="flex items-center gap-1.5">
										<p className="text-sm font-semibold leading-none">{authLoading ? "Loading..." : displayName}</p>
										{isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />}
									</div>
									<p className="text-xs leading-none text-muted-foreground">@{profile?.username ?? "explorer"}</p>
								</div>
							</div>
						</DropdownMenuLabel>

						{/* Contribution Stats */}
						<div className="flex items-center justify-around px-2 py-3 border-y border-border/30 my-2">
							<div className="flex flex-col items-center">
								<span className="text-sm font-bold">{contributionCount}</span>
								<span className="text-[10px] text-muted-foreground">Contributions</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-sm font-bold">24</span>
								<span className="text-[10px] text-muted-foreground">Sites</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-sm font-bold">8</span>
								<span className="text-[10px] text-muted-foreground">Following</span>
							</div>
						</div>

						<DropdownMenuItem asChild>
							<Link href={profileHref} className="cursor-pointer">
								<UserCircle className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/library/contributions" className="cursor-pointer">
								<Upload className="mr-2 h-4 w-4" />
								<span>My Contributions</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/library/saved" className="cursor-pointer">
								<Library className="mr-2 h-4 w-4" />
								<span>Saved Sites</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="md:hidden">
							<Link href="/notifications" className="cursor-pointer">
								<Bell className="mr-2 h-4 w-4" />
								<span>Notifications</span>
								{unreadNotifications > 0 && (
									<Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
										{unreadNotifications}
									</Badge>
								)}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/profile#settings" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-border/30" />
						<DropdownMenuItem
							className="cursor-pointer text-destructive focus:text-destructive"
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
