"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { followSite, unfollowSite } from "@/lib/supabase/profile-actions";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SiteFollowButtonProps {
	siteId: string;
	initialIsFollowing: boolean;
	onToggle?: (newState: boolean) => void;
	variant?: "default" | "compact" | "icon-only";
	className?: string;
}

export function SiteFollowButton({
	siteId,
	initialIsFollowing,
	onToggle,
	variant = "default",
	className,
}: SiteFollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isPending, startTransition] = useTransition();

	const handleToggle = () => {
		startTransition(async () => {
			try {
				if (isFollowing) {
					await unfollowSite(siteId);
					setIsFollowing(false);
					onToggle?.(false);
				} else {
					await followSite(siteId);
					setIsFollowing(true);
					onToggle?.(true);
				}
			} catch (error) {
				console.error("Failed to toggle site follow", error);
			}
		});
	};

	if (variant === "icon-only") {
		return (
			<Button
				variant={isFollowing ? "secondary" : "outline"}
				size="icon"
				onClick={handleToggle}
				disabled={isPending}
				className={cn("h-8 w-8", className)}
				title={isFollowing ? "Unfollow site" : "Follow site for updates"}
			>
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : isFollowing ? (
					<Bell className="h-4 w-4 fill-current" />
				) : (
					<Bell className="h-4 w-4" />
				)}
			</Button>
		);
	}

	if (variant === "compact") {
		return (
			<Button
				variant={isFollowing ? "secondary" : "outline"}
				size="sm"
				onClick={handleToggle}
				disabled={isPending}
				className={cn("gap-1.5 h-8 px-2.5", className)}
			>
				{isPending ? (
					<Loader2 className="h-3.5 w-3.5 animate-spin" />
				) : isFollowing ? (
					<Bell className="h-3.5 w-3.5 fill-current" />
				) : (
					<Bell className="h-3.5 w-3.5" />
				)}
				<span className="text-xs">{isFollowing ? "Following" : "Follow"}</span>
			</Button>
		);
	}

	return (
		<Button
			variant={isFollowing ? "outline" : "default"}
			size="sm"
			onClick={handleToggle}
			disabled={isPending}
			className={cn("gap-2", className)}
		>
			{isPending ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : isFollowing ? (
				<>
					<BellOff className="h-4 w-4" /> Unfollow
				</>
			) : (
				<>
					<Bell className="h-4 w-4" /> Follow
				</>
			)}
		</Button>
	);
}

