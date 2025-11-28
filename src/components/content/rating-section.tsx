"use client";

import { useState } from "react";
import Link from "next/link";
import { Rating as RatingType } from "@/shared/types/content";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Star, ThumbsUp, ThumbsDown, VerifiedIcon } from "lucide-react";
import { timeAgo } from "@/shared/lib/utils";

interface StarRatingProps {
	rating: number;
	onChange?: (rating: number) => void;
	readonly?: boolean;
	size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, onChange, readonly = false, size = "md" }: StarRatingProps) {
	const [hoverRating, setHoverRating] = useState(0);

	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-6 w-6",
	};

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => {
				const filled = star <= (hoverRating || rating);
				return (
					<button
						key={star}
						type="button"
						onClick={() => !readonly && onChange?.(star)}
						onMouseEnter={() => !readonly && setHoverRating(star)}
						onMouseLeave={() => !readonly && setHoverRating(0)}
						disabled={readonly}
						className={`${!readonly && "cursor-pointer hover:scale-110"} transition-transform`}
					>
						<Star
							className={`${sizeClasses[size]} ${
								filled ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700"
							}`}
						/>
					</button>
				);
			})}
		</div>
	);
}

interface RatingFormProps {
	onSubmit: (rating: number, review?: string) => void;
	existingRating?: RatingType;
	isLoading?: boolean;
}

function RatingForm({ onSubmit, existingRating, isLoading }: RatingFormProps) {
	const [rating, setRating] = useState(existingRating?.rating || 0);
	const [review, setReview] = useState(existingRating?.review || "");

	const handleSubmit = () => {
		if (rating > 0) {
			onSubmit(rating, review || undefined);
		}
	};

	return (
		<Card className="glass-panel border-border/40">
			<CardHeader>
				<CardTitle className="text-lg">{existingRating ? "Update Your Rating" : "Rate This Content"}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Your Rating</label>
					<StarRating rating={rating} onChange={setRating} size="lg" />
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Review (optional)</label>
					<Textarea
						placeholder="Share your detailed thoughts..."
						value={review}
						onChange={(e) => setReview(e.target.value)}
						className="min-h-[120px]"
					/>
				</div>

				<Button onClick={handleSubmit} disabled={rating === 0 || isLoading}>
					{existingRating ? "Update Rating" : "Submit Rating"}
				</Button>
			</CardContent>
		</Card>
	);
}

interface RatingItemProps {
	rating: RatingType;
	onMarkHelpful?: (ratingId: string, helpful: boolean) => void;
	currentUserId?: string;
}

function RatingItem({ rating, onMarkHelpful, currentUserId }: RatingItemProps) {
	return (
		<div className="rounded-lg border border-border/40 bg-card/70 p-4 space-y-3">
			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<Link href={`/profile/${rating.user.username}`}>
						<Avatar className="h-10 w-10">
							<AvatarImage src={rating.user.avatar} />
							<AvatarFallback>{rating.user.displayName[0]}</AvatarFallback>
						</Avatar>
					</Link>
					<div>
						<Link href={`/profile/${rating.user.username}`} className="flex items-center gap-1 text-sm font-medium hover:underline">
							{rating.user.displayName}
							{rating.user.verificationStatus === "verified" && <VerifiedIcon className="h-3 w-3 text-blue-500" />}
						</Link>
						<div className="flex items-center gap-2">
							<StarRating rating={rating.rating} readonly size="sm" />
							<span className="text-xs text-muted-foreground">
								{timeAgo(rating.createdAt)}
								{rating.updatedAt && rating.updatedAt !== rating.createdAt && " • edited"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Review Text */}
			{rating.review && <p className="text-sm text-foreground whitespace-pre-wrap">{rating.review}</p>}

			{/* Helpful Actions */}
			<div className="flex items-center gap-4 pt-2 border-t border-border/40">
				<span className="text-xs text-muted-foreground">Was this helpful?</span>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onMarkHelpful?.(rating.id, true)}
						className="gap-1 h-7"
						disabled={rating.user.userId === currentUserId}
					>
						<ThumbsUp className="h-3 w-3" />
						<span className="text-xs">{rating.helpfulCount}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onMarkHelpful?.(rating.id, false)}
						className="gap-1 h-7"
						disabled={rating.user.userId === currentUserId}
					>
						<ThumbsDown className="h-3 w-3" />
						<span className="text-xs">{rating.notHelpfulCount}</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

interface RatingSectionProps {
	ratings: RatingType[];
	averageRating: number;
	totalRatings: number;
	userRating?: RatingType;
	onSubmitRating: (rating: number, review?: string) => void;
	onMarkHelpful?: (ratingId: string, helpful: boolean) => void;
	currentUserId?: string;
	isLoading?: boolean;
}

export function RatingSection({
	ratings,
	averageRating,
	totalRatings,
	userRating,
	onSubmitRating,
	onMarkHelpful,
	currentUserId,
	isLoading = false,
}: RatingSectionProps) {
	const [showAllRatings, setShowAllRatings] = useState(false);
	const [sortBy, setSortBy] = useState<"recent" | "helpful">("helpful");

	// Calculate rating distribution
	const distribution = [5, 4, 3, 2, 1].map((star) => ({
		star,
		count: ratings.filter((r) => r.rating === star).length,
		percentage: totalRatings > 0 ? (ratings.filter((r) => r.rating === star).length / totalRatings) * 100 : 0,
	}));

	// Sort ratings
	const sortedRatings = [...ratings].sort((a, b) => {
		if (sortBy === "helpful") {
			return b.helpfulCount - a.helpfulCount;
		}
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const displayedRatings = showAllRatings ? sortedRatings : sortedRatings.slice(0, 3);

	return (
		<div className="space-y-6">
			{/* Overall Rating Summary */}
			<Card className="glass-panel border-border/40">
				<CardHeader>
					<CardTitle className="text-lg">Ratings & Reviews</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-col md:flex-row gap-8">
						{/* Average Rating */}
						<div className="flex flex-col items-center justify-center gap-2 md:border-r md:border-border/40 md:pr-8">
							<div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
							<StarRating rating={Math.round(averageRating)} readonly size="lg" />
							<div className="text-sm text-muted-foreground">
								{totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
							</div>
						</div>

						{/* Rating Distribution */}
						<div className="flex-1 space-y-2">
							{distribution.map(({ star, count, percentage }) => (
								<div key={star} className="flex items-center gap-3">
									<div className="flex items-center gap-1 w-16 text-sm">
										<span>{star}</span>
										<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
									</div>
									<div className="flex-1 h-2 bg-secondary/40 rounded-full overflow-hidden">
										<div className="h-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
									</div>
									<div className="w-12 text-sm text-muted-foreground text-right">{count}</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* User's Rating Form */}
			{currentUserId && <RatingForm onSubmit={onSubmitRating} existingRating={userRating} isLoading={isLoading} />}

			{/* Reviews List */}
			{ratings.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Reviews</h3>
						<div className="flex items-center gap-2">
							<Badge variant={sortBy === "helpful" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSortBy("helpful")}>
								Most Helpful
							</Badge>
							<Badge variant={sortBy === "recent" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSortBy("recent")}>
								Most Recent
							</Badge>
						</div>
					</div>

					<div className="space-y-3">
						{displayedRatings.map((rating) => (
							<RatingItem key={rating.id} rating={rating} onMarkHelpful={onMarkHelpful} currentUserId={currentUserId} />
						))}
					</div>

					{sortedRatings.length > 3 && (
						<Button variant="outline" onClick={() => setShowAllRatings(!showAllRatings)} className="w-full">
							{showAllRatings ? "Show Less" : `Show All ${sortedRatings.length} Reviews`}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
