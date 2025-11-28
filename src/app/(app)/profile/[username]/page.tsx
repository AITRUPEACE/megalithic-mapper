import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { getProfileByUsername, isFollowing, type PublicBadge } from "@/lib/supabase/profile";
import { FollowButton } from "@/features/profile/follow-button";
import { MapPin, Globe, Award, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

function BadgeCard({ badge }: { badge: PublicBadge }) {
	return (
		<div className="flex flex-col items-center p-4 border rounded-lg bg-card text-card-foreground text-center space-y-2">
			{badge.iconUrl ? (
				<Image src={badge.iconUrl} alt={badge.name} width={48} height={48} className="h-12 w-12 rounded-full object-contain" />
			) : (
				<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
					<Award className="w-6 h-6 text-primary" />
				</div>
			)}
			<div>
				<h4 className="font-semibold text-sm">{badge.name}</h4>
				<p className="text-xs text-muted-foreground">{badge.description}</p>
			</div>
			{badge.awardedAt && <span className="text-[10px] text-muted-foreground">Earned {format(new Date(badge.awardedAt), "MMM yyyy")}</span>}
		</div>
	);
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
	const profile = await getProfileByUsername(params.username);

	if (!profile) {
		notFound();
	}

	const isFollowingUser = await isFollowing(profile.id);

	return (
		<div className="container max-w-5xl py-8 space-y-8">
			{/* Header Section */}
			<div className="relative">
				<div className="h-48 w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl overflow-hidden">{/* Optional Cover Image */}</div>

				<div className="px-6 relative flex flex-col md:flex-row gap-6 items-start -mt-12">
					<Avatar className="w-32 h-32 border-4 border-background shadow-xl">
						<AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username ?? ""} />
						<AvatarFallback className="text-4xl bg-muted text-muted-foreground">{(profile.username?.[0] ?? "U").toUpperCase()}</AvatarFallback>
					</Avatar>

					<div className="flex-1 pt-14 md:pt-14 space-y-2">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold flex items-center gap-2">
									{profile.full_name || profile.username}
									{profile.is_verified && <ShieldCheck className="w-5 h-5 text-sky-500" aria-label="Verified Expert" />}
								</h1>
								<p className="text-muted-foreground">@{profile.username}</p>
							</div>
							<div className="flex gap-2">
								<FollowButton targetUserId={profile.id} initialIsFollowing={isFollowingUser} />
								{/* <Button variant="outline" size="sm">Message</Button> */}
							</div>
						</div>

						{profile.headline && <p className="text-lg font-medium">{profile.headline}</p>}

						<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
							{profile.location && (
								<div className="flex items-center gap-1">
									<MapPin className="w-4 h-4" />
									{profile.location}
								</div>
							)}
							{profile.website_url && (
								<a
									href={profile.website_url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 hover:text-primary transition-colors"
								>
									<Globe className="w-4 h-4" />
									Website
								</a>
							)}
							{/* Add Join Date if available */}
						</div>

						{/* Stats */}
						<div className="flex gap-6 pt-2">
							<div className="text-sm">
								<span className="font-bold text-foreground">{profile.stats.followers}</span> <span className="text-muted-foreground">Followers</span>
							</div>
							<div className="text-sm">
								<span className="font-bold text-foreground">{profile.stats.following}</span> <span className="text-muted-foreground">Following</span>
							</div>
							<div className="text-sm">
								<span className="font-bold text-foreground">{profile.stats.contributions}</span>{" "}
								<span className="text-muted-foreground">Contributions</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				{/* Left Sidebar Info */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">About</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm leading-relaxed text-muted-foreground">{profile.bio || "No bio yet."}</p>

							{profile.expertise_tags && profile.expertise_tags.length > 0 && (
								<div className="pt-2">
									<h4 className="text-sm font-semibold mb-2">Expertise</h4>
									<div className="flex flex-wrap gap-2">
										{profile.expertise_tags.map((tag) => (
											<Badge key={tag} variant="secondary" className="text-xs">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Badges Preview (Mobile mostly, or supplemental) */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Award className="w-5 h-5" />
								Badges ({profile.badges.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							{profile.badges.length > 0 ? (
								<div className="grid grid-cols-3 gap-2">
									{profile.badges.slice(0, 6).map((badge) => (
										<div key={badge.id} className="flex flex-col items-center text-center" title={badge.name}>
											{badge.iconUrl ? (
												<Image src={badge.iconUrl} alt={badge.name} width={32} height={32} className="h-8 w-8 rounded-full object-contain" />
											) : (
												<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
													<Award className="w-4 h-4 text-primary" />
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No badges yet.</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<div className="md:col-span-2">
					<Tabs defaultValue="contributions" className="w-full">
						<TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
							<TabsTrigger
								value="contributions"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
							>
								Contributions
							</TabsTrigger>
							<TabsTrigger
								value="posts"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
							>
								Posts
							</TabsTrigger>
							<TabsTrigger
								value="badges"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
							>
								Badges
							</TabsTrigger>
						</TabsList>

						<TabsContent value="contributions" className="mt-6">
							<div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
								<p>No verified contributions yet.</p>
							</div>
						</TabsContent>

						<TabsContent value="posts" className="mt-6">
							<div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
								<p>No posts published yet.</p>
							</div>
						</TabsContent>

						<TabsContent value="badges" className="mt-6">
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{profile.badges.map((badge) => (
									<BadgeCard key={badge.id} badge={badge} />
								))}
								{profile.badges.length === 0 && <p className="col-span-full text-center py-12 text-muted-foreground">No badges earned yet.</p>}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
