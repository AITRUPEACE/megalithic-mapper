"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { ThumbsUp, ThumbsDown, HelpCircle, Loader2 } from "lucide-react";

type VoteType = "approve" | "reject" | "needs_info";

interface VoteState {
	votes: {
		approve: number;
		reject: number;
		needs_info: number;
	};
	verificationStatus: string;
	userVote: VoteType | null;
}

interface SiteVoteButtonsProps {
	siteId: string;
	compact?: boolean;
	className?: string;
	onVoteChange?: (votes: VoteState["votes"]) => void;
}

export function SiteVoteButtons({ siteId, compact = false, className, onVoteChange }: SiteVoteButtonsProps) {
	const [voteState, setVoteState] = useState<VoteState | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isVoting, setIsVoting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch current vote state
	const fetchVotes = useCallback(async () => {
		try {
			const response = await fetch(`/api/sites/${siteId}/vote`);
			if (!response.ok) throw new Error("Failed to fetch votes");
			const data = await response.json();
			setVoteState(data);
			setError(null);
		} catch (err) {
			console.error("Error fetching votes:", err);
			setError("Failed to load votes");
		} finally {
			setIsLoading(false);
		}
	}, [siteId]);

	useEffect(() => {
		fetchVotes();
	}, [fetchVotes]);

	// Handle vote
	const handleVote = async (voteType: VoteType) => {
		if (isVoting || !voteState) return;

		setIsVoting(true);
		setError(null);

		try {
			// If clicking the same vote, remove it
			if (voteState.userVote === voteType) {
				const response = await fetch(`/api/sites/${siteId}/vote`, {
					method: "DELETE",
				});
				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || "Failed to remove vote");
				}
			} else {
				// Cast or change vote
				const response = await fetch(`/api/sites/${siteId}/vote`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ voteType }),
				});
				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || "Failed to cast vote");
				}
			}

			// Refresh vote state
			await fetchVotes();
			if (voteState && onVoteChange) {
				onVoteChange(voteState.votes);
			}
		} catch (err) {
			console.error("Error voting:", err);
			setError(err instanceof Error ? err.message : "Failed to vote");
		} finally {
			setIsVoting(false);
		}
	};

	if (isLoading) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				<span className="text-xs text-muted-foreground">Loading votes...</span>
			</div>
		);
	}

	if (error && !voteState) {
		return (
			<div className={cn("text-xs text-destructive", className)}>
				{error}
				<Button variant="link" size="sm" onClick={fetchVotes} className="ml-2 h-auto p-0 text-xs">
					Retry
				</Button>
			</div>
		);
	}

	const votes = voteState?.votes ?? { approve: 0, reject: 0, needs_info: 0 };
	const userVote = voteState?.userVote;
	const totalVotes = votes.approve + votes.reject + votes.needs_info;

	if (compact) {
		return (
			<div className={cn("flex items-center gap-1", className)}>
				<Button
					variant={userVote === "approve" ? "default" : "ghost"}
					size="sm"
					className={cn("h-7 gap-1 px-2", userVote === "approve" && "bg-green-600 hover:bg-green-700 text-white")}
					onClick={() => handleVote("approve")}
					disabled={isVoting}
				>
					<ThumbsUp className="h-3.5 w-3.5" />
					<span className="text-xs">{votes.approve}</span>
				</Button>
				<Button
					variant={userVote === "reject" ? "default" : "ghost"}
					size="sm"
					className={cn("h-7 gap-1 px-2", userVote === "reject" && "bg-red-600 hover:bg-red-700 text-white")}
					onClick={() => handleVote("reject")}
					disabled={isVoting}
				>
					<ThumbsDown className="h-3.5 w-3.5" />
					<span className="text-xs">{votes.reject}</span>
				</Button>
				<Button
					variant={userVote === "needs_info" ? "default" : "ghost"}
					size="sm"
					className={cn("h-7 gap-1 px-2", userVote === "needs_info" && "bg-amber-600 hover:bg-amber-700 text-white")}
					onClick={() => handleVote("needs_info")}
					disabled={isVoting}
				>
					<HelpCircle className="h-3.5 w-3.5" />
					<span className="text-xs">{votes.needs_info}</span>
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">Community Verification</p>
				<span className="text-xs text-muted-foreground">{totalVotes} votes</span>
			</div>

			{error && <p className="text-xs text-destructive">{error}</p>}

			<div className="flex flex-wrap gap-2">
				<Button
					variant={userVote === "approve" ? "default" : "outline"}
					size="sm"
					className={cn("gap-2 flex-1 min-w-[100px]", userVote === "approve" && "bg-green-600 hover:bg-green-700 text-white border-green-600")}
					onClick={() => handleVote("approve")}
					disabled={isVoting}
				>
					{isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
					<span>Approve</span>
					<span className="ml-auto rounded-full bg-background/20 px-2 py-0.5 text-xs">{votes.approve}</span>
				</Button>

				<Button
					variant={userVote === "reject" ? "default" : "outline"}
					size="sm"
					className={cn("gap-2 flex-1 min-w-[100px]", userVote === "reject" && "bg-red-600 hover:bg-red-700 text-white border-red-600")}
					onClick={() => handleVote("reject")}
					disabled={isVoting}
				>
					{isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
					<span>Reject</span>
					<span className="ml-auto rounded-full bg-background/20 px-2 py-0.5 text-xs">{votes.reject}</span>
				</Button>

				<Button
					variant={userVote === "needs_info" ? "default" : "outline"}
					size="sm"
					className={cn("gap-2 flex-1 min-w-[100px]", userVote === "needs_info" && "bg-amber-600 hover:bg-amber-700 text-white border-amber-600")}
					onClick={() => handleVote("needs_info")}
					disabled={isVoting}
				>
					{isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
					<span>Needs Info</span>
					<span className="ml-auto rounded-full bg-background/20 px-2 py-0.5 text-xs">{votes.needs_info}</span>
				</Button>
			</div>

			{/* Progress bar showing approval ratio */}
			{totalVotes > 0 && (
				<div className="space-y-1">
					<div className="flex h-2 overflow-hidden rounded-full bg-muted">
						<div className="bg-green-500 transition-all duration-300" style={{ width: `${(votes.approve / totalVotes) * 100}%` }} />
						<div className="bg-amber-500 transition-all duration-300" style={{ width: `${(votes.needs_info / totalVotes) * 100}%` }} />
						<div className="bg-red-500 transition-all duration-300" style={{ width: `${(votes.reject / totalVotes) * 100}%` }} />
					</div>
					<p className="text-[10px] text-muted-foreground">
						{votes.approve >= 5 && votes.reject === 0
							? "Ready for auto-verification!"
							: `${5 - votes.approve} more approvals needed for verification`}
					</p>
				</div>
			)}

			{userVote && (
				<p className="text-xs text-muted-foreground">
					You voted: <span className="font-medium text-foreground">{userVote.replace("_", " ")}</span>{" "}
					<button className="text-primary hover:underline" onClick={() => handleVote(userVote)} disabled={isVoting}>
						Remove vote
					</button>
				</p>
			)}
		</div>
	);
}


