# PRD: Reusable Implementation Patterns

> **Purpose**: Document reusable patterns from the Megalithic Mapper project for implementation in other applications.

---

## Table of Contents

1. [Progressive Bottom Drawer](#1-progressive-bottom-drawer)
2. [Dev Auth System](#2-dev-auth-system)

---

## 1. Progressive Bottom Drawer

### 1.1 Overview

A mobile-optimized bottom sheet component with three states: **closed**, **peek** (50vh), and **expanded** (90vh). Uses Framer Motion for smooth animations and supports intuitive drag gestures.

### 1.2 Key Features

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| Three-state system | `closed` → `peek` → `expanded`                   |
| Scroll-to-expand   | Scrolling down in peek mode auto-expands         |
| Drag gestures      | Swipe up/down on handle to expand/collapse/close |
| Haptic feedback    | Vibration on state changes (mobile devices)      |
| Backdrop           | Semi-transparent backdrop with blur effect       |
| Spring animations  | Natural-feeling physics-based transitions        |
| Mobile-only        | Hidden on desktop (`md:hidden`)                  |

### 1.3 Technical Requirements

#### Dependencies

```bash
npm install framer-motion
```

#### File Structure

```
src/components/ui/
├── progressive-drawer.tsx      # Main drawer component
└── drawer-content.tsx          # Optional: Content component
```

### 1.4 State Configuration

```typescript
type DrawerState = "closed" | "peek" | "expanded";

const DRAWER_STATES = {
	closed: 0, // Hidden
	peek: 50, // 50% of viewport height
	expanded: 90, // 90% of viewport height
};
```

### 1.5 Gesture Behavior

| Action           | Trigger            | Result                                          |
| ---------------- | ------------------ | ----------------------------------------------- |
| Fast swipe down  | `velocity.y > 500` | Close drawer                                    |
| Drag down >100px | `offset.y > 100`   | Collapse (expanded→peek) or close (peek→closed) |
| Drag up >100px   | `offset.y < -100`  | Expand (peek→expanded)                          |
| Scroll >30px     | `scrollTop > 30`   | Expand (peek→expanded)                          |
| Backdrop click   | Click outside      | Close drawer                                    |
| X button         | Click              | Close drawer                                    |

### 1.6 Implementation

#### Complete Component Code

```tsx
// src/components/ui/progressive-drawer.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DrawerState = "closed" | "peek" | "expanded";

const DRAWER_STATES = {
	closed: 0,
	peek: 50,
	expanded: 90,
};

// Haptic feedback helper
const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
	if (typeof window !== "undefined" && "vibrate" in navigator) {
		const patterns = { light: 10, medium: 20, heavy: 30 };
		navigator.vibrate(patterns[type]);
	}
};

interface ProgressiveDrawerProps {
	open: boolean;
	onClose: () => void;
	children?: React.ReactNode;
}

export const ProgressiveDrawer = ({ open, onClose, children }: ProgressiveDrawerProps) => {
	const [drawerState, setDrawerState] = useState<DrawerState>("closed");
	const [isDragging, setIsDragging] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const controls = useAnimation();

	// Open/close effect
	useEffect(() => {
		if (open) {
			setDrawerState("peek");
			controls.start({
				height: `${DRAWER_STATES.peek}vh`,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			});
			triggerHaptic("light");
		} else {
			setDrawerState("closed");
			controls.start({
				height: 0,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			});
		}
	}, [open, controls]);

	// Scroll-to-expand behavior
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			if (drawerState !== "peek") return;

			if (e.currentTarget.scrollTop > 30) {
				setDrawerState("expanded");
				controls.start({
					height: `${DRAWER_STATES.expanded}vh`,
					transition: { type: "spring", damping: 30, stiffness: 300 },
				});
				triggerHaptic("light");
			}
		},
		[drawerState, controls]
	);

	// Close handler
	const handleClose = useCallback(() => {
		setDrawerState("closed");
		triggerHaptic("medium");
		controls
			.start({
				height: 0,
				transition: { type: "spring", damping: 30, stiffness: 300 },
			})
			.then(() => {
				if (contentRef.current) contentRef.current.scrollTop = 0;
				onClose();
			});
	}, [controls, onClose]);

	// Drag gesture handler
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			setIsDragging(false);
			const { velocity, offset } = info;

			// Fast swipe down = close
			if (velocity.y > 500) {
				handleClose();
				return;
			}

			// Dragged down significantly
			if (offset.y > 100) {
				if (drawerState === "expanded") {
					setDrawerState("peek");
					controls.start({
						height: `${DRAWER_STATES.peek}vh`,
						transition: { type: "spring", damping: 30, stiffness: 300 },
					});
					triggerHaptic("light");
				} else {
					handleClose();
				}
				return;
			}

			// Dragged up = expand
			if (offset.y < -100 && drawerState === "peek") {
				setDrawerState("expanded");
				controls.start({
					height: `${DRAWER_STATES.expanded}vh`,
					transition: { type: "spring", damping: 30, stiffness: 300 },
				});
				triggerHaptic("light");
			}
		},
		[drawerState, controls, handleClose]
	);

	// Android back button support
	useEffect(() => {
		if (!open) return;
		const handlePopState = () => handleClose();
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [open, handleClose]);

	return (
		<>
			{/* Backdrop */}
			<motion.div
				className={cn("fixed inset-0 z-[450] bg-black/20 backdrop-blur-sm", "md:hidden")}
				initial={{ opacity: 0 }}
				animate={{ opacity: open ? 1 : 0 }}
				transition={{ duration: 0.2 }}
				onClick={handleClose}
				style={{ pointerEvents: open ? "auto" : "none" }}
			/>

			{/* Drawer */}
			<motion.div
				className={cn(
					"fixed bottom-0 left-0 right-0 z-[460]",
					"bg-background/98 backdrop-blur-xl",
					"rounded-t-3xl shadow-2xl",
					"border-t border-l border-r border-border/40",
					"md:hidden",
					isDragging && "cursor-grabbing"
				)}
				initial={{ height: 0 }}
				animate={controls}
				style={{ touchAction: "none" }}
			>
				{/* Drag Handle Area */}
				<motion.div
					className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm rounded-t-3xl"
					drag="y"
					dragConstraints={{ top: 0, bottom: 0 }}
					dragElastic={0.2}
					onDragStart={() => setIsDragging(true)}
					onDragEnd={handleDragEnd}
				>
					{/* Visual drag handle */}
					<div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
						<div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
					</div>

					{/* Header */}
					<div className="flex items-center justify-between px-4 pb-3">
						<div className="flex items-center gap-2">
							<ChevronDown
								className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", drawerState === "expanded" && "rotate-180")}
							/>
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								{drawerState === "peek" ? "Scroll for more" : "Swipe down to collapse"}
							</span>
						</div>
						<Button size="sm" variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</motion.div>

				{/* Scrollable Content */}
				<div ref={contentRef} className="h-full overflow-y-auto overscroll-contain pb-safe" onScroll={handleScroll}>
					<div className="px-4 pb-8">{children}</div>
				</div>
			</motion.div>
		</>
	);
};
```

### 1.7 Usage Examples

#### Basic Usage

```tsx
import { ProgressiveDrawer } from "@/components/ui/progressive-drawer";
import { useState } from "react";

function MyComponent() {
	const [selectedItem, setSelectedItem] = useState(null);

	return (
		<ProgressiveDrawer open={!!selectedItem} onClose={() => setSelectedItem(null)}>
			{selectedItem && (
				<div className="space-y-4">
					<h2 className="text-2xl font-bold">{selectedItem.name}</h2>
					<p>{selectedItem.description}</p>
				</div>
			)}
		</ProgressiveDrawer>
	);
}
```

#### With Custom Content Component

```tsx
<ProgressiveDrawer open={open} onClose={onClose}>
	<ItemHeader item={item} />
	<ItemDetails item={item} />
	<RelatedItems items={relatedItems} onSelect={handleSelect} />
	<ActionButtons item={item} />
</ProgressiveDrawer>
```

### 1.8 Customization Options

| Property                 | Default | Description                         |
| ------------------------ | ------- | ----------------------------------- |
| `DRAWER_STATES.peek`     | `50`    | Peek height in vh                   |
| `DRAWER_STATES.expanded` | `90`    | Expanded height in vh               |
| `damping`                | `30`    | Spring animation damping            |
| `stiffness`              | `300`   | Spring animation stiffness          |
| Scroll threshold         | `30`    | Pixels to scroll before auto-expand |
| Drag threshold           | `100`   | Pixels to drag before state change  |
| Velocity threshold       | `500`   | Swipe velocity for instant close    |

---

## 2. Dev Auth System

### 2.1 Overview

A development-only authentication system that allows instant switching between different user roles/profiles without setting up actual authentication. Essential for testing role-based features, onboarding flows, and permission systems.

### 2.2 Key Features

| Feature             | Description                                      |
| ------------------- | ------------------------------------------------ |
| Multiple mock users | Pre-configured users with different roles        |
| Persistent sessions | Uses localStorage + cookies                      |
| Middleware bypass   | Cookies bypass protected route middleware in dev |
| Automatic routing   | Redirects based on user profile state            |
| Production-safe     | Completely hidden in production builds           |
| Visual indicator    | Floating panel shows current auth state          |

### 2.3 Technical Requirements

#### File Structure

```
src/components/dev/
├── dev-auth-panel.tsx      # UI component with user selection
├── dev-auth-provider.tsx   # Context provider + hooks
└── dev-mode-wrapper.tsx    # Combines panel + provider
```

### 2.4 Mock User Configuration

```typescript
export const DEV_USERS = {
	admin: {
		id: "dev-admin-001",
		email: "admin@myapp.dev",
		username: "admin",
		full_name: "Dev Admin",
		role: "admin",
		is_verified: true,
	},
	researcher: {
		id: "dev-researcher-001",
		email: "researcher@myapp.dev",
		username: "dr_jones",
		full_name: "Dr. Indiana Jones",
		role: "researcher",
		is_verified: true,
	},
	creator: {
		id: "dev-creator-001",
		email: "creator@myapp.dev",
		username: "content_creator",
		full_name: "Content Creator",
		role: "expert",
		is_verified: true,
	},
	contributor: {
		id: "dev-contributor-001",
		email: "contributor@myapp.dev",
		username: "contributor",
		full_name: "Alex Rivera",
		role: "contributor",
		is_verified: false,
	},
	newuser: {
		id: "dev-newuser-001",
		email: "newuser@myapp.dev",
		username: "",
		full_name: "",
		role: "user",
		is_verified: false,
		onboarding_completed: false,
	},
} as const;
```

### 2.5 Implementation

#### File 1: Dev Auth Panel (`dev-auth-panel.tsx`)

```tsx
"use client";

import { useState } from "react";
import { User, Shield, GraduationCap, Video, Users, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define your mock users
export const DEV_USERS = {
	admin: {
		id: "dev-admin-001",
		email: "admin@myapp.dev",
		username: "admin",
		full_name: "Dev Admin",
		role: "admin",
		is_verified: true,
	},
	researcher: {
		id: "dev-researcher-001",
		email: "researcher@myapp.dev",
		username: "dr_jones",
		full_name: "Dr. Indiana Jones",
		role: "researcher",
		is_verified: true,
	},
	creator: {
		id: "dev-creator-001",
		email: "creator@myapp.dev",
		username: "content_creator",
		full_name: "Content Creator",
		role: "expert",
		is_verified: true,
	},
	contributor: {
		id: "dev-contributor-001",
		email: "contributor@myapp.dev",
		username: "contributor",
		full_name: "Alex Rivera",
		role: "contributor",
		is_verified: false,
	},
	newuser: {
		id: "dev-newuser-001",
		email: "newuser@myapp.dev",
		username: "",
		full_name: "",
		role: "user",
		is_verified: false,
		onboarding_completed: false,
	},
} as const;

export type DevUserKey = keyof typeof DEV_USERS;

const userConfig: Record<DevUserKey, { label: string; icon: typeof User; color: string }> = {
	admin: { label: "Admin", icon: Shield, color: "text-red-500" },
	researcher: { label: "Researcher", icon: GraduationCap, color: "text-blue-500" },
	creator: { label: "Content Creator", icon: Video, color: "text-purple-500" },
	contributor: { label: "Contributor", icon: Users, color: "text-green-500" },
	newuser: { label: "New User", icon: User, color: "text-muted-foreground" },
};

interface DevAuthPanelProps {
	onSignIn: (userKey: DevUserKey) => void;
	currentUser?: DevUserKey | null;
	onSignOut?: () => void;
}

export function DevAuthPanel({ onSignIn, currentUser, onSignOut }: DevAuthPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Only show in development
	if (process.env.NODE_ENV === "production") return null;

	return (
		<div className="fixed bottom-4 right-4 z-[9999]">
			<div className="relative">
				{isOpen && (
					<div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-amber-500/30 bg-slate-900 p-3 shadow-xl">
						<div className="mb-2 flex items-center justify-between">
							<p className="text-xs font-semibold uppercase tracking-wider text-amber-500">🔧 Dev Auth</p>
							{currentUser && onSignOut && (
								<Button
									size="sm"
									variant="ghost"
									className="h-6 px-2 text-xs text-muted-foreground"
									onClick={() => {
										onSignOut();
										setIsOpen(false);
									}}
								>
									<LogOut className="mr-1 h-3 w-3" />
									Sign out
								</Button>
							)}
						</div>

						<div className="space-y-1">
							{(Object.keys(DEV_USERS) as DevUserKey[]).map((key) => {
								const config = userConfig[key];
								const user = DEV_USERS[key];
								const Icon = config.icon;
								const isActive = currentUser === key;

								return (
									<button
										key={key}
										onClick={() => {
											onSignIn(key);
											setIsOpen(false);
										}}
										className={cn(
											"flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
											isActive ? "bg-amber-500/20 text-amber-500" : "hover:bg-white/5"
										)}
									>
										<Icon className={cn("h-4 w-4", config.color)} />
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">
												{config.label}
												{isActive && " ✓"}
											</p>
											<p className="text-xs text-muted-foreground truncate">{user.full_name || "No profile yet"}</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}

				<Button
					size="sm"
					variant="outline"
					className={cn("border-amber-500/30 bg-slate-900 text-amber-500 hover:bg-amber-500/10", currentUser && "border-amber-500")}
					onClick={() => setIsOpen(!isOpen)}
				>
					<Shield className="mr-2 h-4 w-4" />
					{currentUser ? userConfig[currentUser].label : "Dev Auth"}
					<ChevronDown className={cn("ml-2 h-3 w-3 transition-transform", isOpen && "rotate-180")} />
				</Button>
			</div>
		</div>
	);
}
```

#### File 2: Dev Auth Provider (`dev-auth-provider.tsx`)

```tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { DEV_USERS, type DevUserKey } from "./dev-auth-panel";

const DEV_AUTH_STORAGE_KEY = "myapp-dev-user";

interface DevAuthContextValue {
	devUser: (typeof DEV_USERS)[DevUserKey] | null;
	devUserKey: DevUserKey | null;
	isDevMode: boolean;
	signInAsDev: (userKey: DevUserKey) => void;
	signOutDev: () => void;
}

const DevAuthContext = createContext<DevAuthContextValue | undefined>(undefined);

export function DevAuthProvider({ children }: { children: ReactNode }) {
	const [devUserKey, setDevUserKey] = useState<DevUserKey | null>(null);
	const [mounted, setMounted] = useState(false);
	const isDevMode = process.env.NODE_ENV === "development";

	// Load from localStorage on mount
	useEffect(() => {
		setMounted(true);
		if (isDevMode && typeof window !== "undefined") {
			const stored = localStorage.getItem(DEV_AUTH_STORAGE_KEY);
			if (stored && stored in DEV_USERS) {
				setDevUserKey(stored as DevUserKey);
			}
		}
	}, [isDevMode]);

	const signInAsDev = (userKey: DevUserKey) => {
		setDevUserKey(userKey);
		if (typeof window !== "undefined") {
			localStorage.setItem(DEV_AUTH_STORAGE_KEY, userKey);
			// Set cookies for middleware bypass
			document.cookie = `dev-auth-bypass=true; path=/; max-age=86400`;
			document.cookie = `dev-user-id=${DEV_USERS[userKey].id}; path=/; max-age=86400`;
			document.cookie = `dev-user-key=${userKey}; path=/; max-age=86400`;
		}
	};

	const signOutDev = () => {
		setDevUserKey(null);
		if (typeof window !== "undefined") {
			localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
			// Clear cookies
			document.cookie = "dev-auth-bypass=; path=/; max-age=0";
			document.cookie = "dev-user-id=; path=/; max-age=0";
			document.cookie = "dev-user-key=; path=/; max-age=0";
		}
	};

	const devUser = devUserKey ? DEV_USERS[devUserKey] : null;

	// Prevent hydration mismatch
	if (!mounted) return <>{children}</>;

	return <DevAuthContext.Provider value={{ devUser, devUserKey, isDevMode, signInAsDev, signOutDev }}>{children}</DevAuthContext.Provider>;
}

export function useDevAuth(): DevAuthContextValue {
	const context = useContext(DevAuthContext);
	if (!context) {
		return {
			devUser: null,
			devUserKey: null,
			isDevMode: process.env.NODE_ENV === "development",
			signInAsDev: () => {},
			signOutDev: () => {},
		};
	}
	return context;
}
```

#### File 3: Dev Mode Wrapper (`dev-mode-wrapper.tsx`)

```tsx
"use client";

import { useRouter } from "next/navigation";
import { DevAuthProvider, useDevAuth } from "./dev-auth-provider";
import { DevAuthPanel, type DevUserKey, DEV_USERS } from "./dev-auth-panel";

function DevAuthPanelInner() {
	const router = useRouter();
	const { devUserKey, signInAsDev, signOutDev } = useDevAuth();

	const handleSignIn = (userKey: DevUserKey) => {
		signInAsDev(userKey);

		// Navigate based on user state
		const user = DEV_USERS[userKey];
		if (userKey === "newuser" || !user.username) {
			router.push("/onboarding");
		} else {
			router.push("/dashboard"); // Your main authenticated route
		}

		router.refresh();
	};

	const handleSignOut = () => {
		signOutDev();
		router.push("/");
		router.refresh();
	};

	return <DevAuthPanel currentUser={devUserKey} onSignIn={handleSignIn} onSignOut={handleSignOut} />;
}

export function DevModeWrapper({ children }: { children: React.ReactNode }) {
	return (
		<DevAuthProvider>
			{children}
			<DevAuthPanelInner />
		</DevAuthProvider>
	);
}
```

### 2.6 Integration

#### Root Layout (`app/layout.tsx`)

```tsx
import { DevModeWrapper } from "@/components/dev/dev-mode-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<DevModeWrapper>
					{/* Your other providers (Theme, Auth, etc.) */}
					{children}
				</DevModeWrapper>
			</body>
		</html>
	);
}
```

#### Middleware (`middleware.ts`)

```typescript
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings", "/admin"];

const isProtectedPath = (pathname: string) => {
	return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip public paths and static files
	if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	if (!isProtectedPath(pathname)) {
		return NextResponse.next();
	}

	// ========================================
	// DEV AUTH BYPASS - Development Only
	// ========================================
	const devAuthBypass = request.cookies.get("dev-auth-bypass")?.value;
	if (process.env.NODE_ENV === "development" && devAuthBypass === "true") {
		console.log("🔧 Dev auth bypass active for:", pathname);
		return NextResponse.next();
	}
	// ========================================

	// Your normal auth check here (Supabase, NextAuth, etc.)
	// Example with Supabase:
	// const supabase = createServerClient(...);
	// const { data: { user } } = await supabase.auth.getUser();
	// if (!user) {
	//   return NextResponse.redirect(new URL('/login', request.url));
	// }

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 2.7 Usage in Components

```tsx
"use client";

import { useDevAuth } from "@/components/dev/dev-auth-provider";

function MyProtectedComponent() {
  const { devUser, isDevMode } = useDevAuth();

  // In dev mode, use devUser; in production, use your real auth
  const user = isDevMode ? devUser : /* your real auth user */;

  if (!user) {
    return <p>Please sign in</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.full_name || user.username}</h1>
      <p>Role: {user.role}</p>

      {/* Role-based content */}
      {user.role === "admin" && <AdminPanel />}
      {user.is_verified && <VerifiedBadge />}
    </div>
  );
}
```

### 2.8 Customizing Mock Users

To add or modify mock users, edit the `DEV_USERS` object:

```typescript
export const DEV_USERS = {
	// ... existing users ...

	// Add a new user type
	moderator: {
		id: "dev-moderator-001",
		email: "moderator@myapp.dev",
		username: "mod_user",
		full_name: "Site Moderator",
		role: "moderator",
		is_verified: true,
		permissions: ["edit", "delete", "ban"],
	},
} as const;

// Update the userConfig for UI
const userConfig: Record<DevUserKey, { label: string; icon: typeof User; color: string }> = {
	// ... existing configs ...
	moderator: { label: "Moderator", icon: ShieldCheck, color: "text-orange-500" },
};
```

---

## 3. Quick Reference

### Progressive Drawer

| Component           | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `ProgressiveDrawer` | Main drawer with animations and gestures |
| `controls.start()`  | Animate to new height                    |
| `handleDragEnd`     | Process gesture completion               |
| `handleScroll`      | Auto-expand on scroll                    |
| `triggerHaptic`     | Mobile vibration feedback                |

### Dev Auth System

| Component         | Purpose                      |
| ----------------- | ---------------------------- |
| `DevModeWrapper`  | Root wrapper (add to layout) |
| `DevAuthProvider` | Context provider             |
| `DevAuthPanel`    | Floating UI panel            |
| `useDevAuth()`    | Hook to access dev user      |
| Cookies           | Middleware bypass mechanism  |

### Cookie Reference

| Cookie            | Purpose                   |
| ----------------- | ------------------------- |
| `dev-auth-bypass` | Enables middleware bypass |
| `dev-user-id`     | Current mock user ID      |
| `dev-user-key`    | Current mock user key     |

---

## 4. Checklist for New Project Implementation

### Progressive Drawer

- [ ] Install `framer-motion`
- [ ] Create `progressive-drawer.tsx` component
- [ ] Create content component if needed
- [ ] Add to page where needed
- [ ] Test on mobile device/emulator
- [ ] Adjust `DRAWER_STATES` heights if needed

### Dev Auth System

- [ ] Create `src/components/dev/` directory
- [ ] Create `dev-auth-panel.tsx`
- [ ] Create `dev-auth-provider.tsx`
- [ ] Create `dev-mode-wrapper.tsx`
- [ ] Customize `DEV_USERS` for your app's roles
- [ ] Add `DevModeWrapper` to root layout
- [ ] Add dev bypass check to middleware
- [ ] Update `DEV_AUTH_STORAGE_KEY` to be unique per app
- [ ] Test all user roles

---

_Last updated: December 2024_
