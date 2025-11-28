"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { followUser, unfollowUser } from "@/lib/supabase/profile-actions";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
	targetUserId: string;
	initialIsFollowing: boolean;
	onToggle?: (newState: boolean) => void;
}

export function FollowButton({ targetUserId, initialIsFollowing, onToggle }: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isPending, startTransition] = useTransition();

	const handleToggle = () => {
		startTransition(async () => {
			try {
				if (isFollowing) {
					await unfollowUser(targetUserId);
					setIsFollowing(false);
					onToggle?.(false);
				} else {
					await followUser(targetUserId);
					setIsFollowing(true);
					onToggle?.(true);
				}
			} catch (error) {
				console.error("Failed to toggle follow", error);
				// Revert on error? Or just show toast
			}
		});
	};

	return (
		<Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={handleToggle} disabled={isPending} className="gap-2">
			{isPending ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : isFollowing ? (
				<>
					<UserMinus className="h-4 w-4" /> Unfollow
				</>
			) : (
				<>
					<UserPlus className="h-4 w-4" /> Follow
				</>
			)}
		</Button>
	);
}
