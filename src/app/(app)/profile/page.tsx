"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useAuth } from "@/components/providers/AuthProvider";
import { PostCard } from "@/components/feed/post-card";
import { User, MapPin, Calendar, Settings, Edit2, Save, X, CheckCircle2, Loader2, ExternalLink, Globe, FileText, PenLine } from "lucide-react";
import { browserClient as supabaseClient } from "@/lib/supabase/clients";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

interface PostData {
	id: string;
	title: string | null;
	body: string;
	excerpt: string | null;
	tags: string[];
	target_type: string;
	target_id: string | null;
	likes_count: number;
	comments_count: number;
	created_at: string;
	author: {
		id: string;
		username: string | null;
		full_name: string | null;
		avatar_url: string | null;
		is_verified: boolean;
		role: string;
	} | null;
}

interface ProfileData {
	id: string;
	username: string | null;
	full_name: string | null;
	headline: string | null;
	bio: string | null;
	avatar_url: string | null;
	location: string | null;
	website_url: string | null;
	role: string;
	is_verified: boolean;
	expertise_tags: string[];
	created_at: string;
}

export default function ProfilePage() {
	const { user, profile: authProfile, loading: authLoading } = useAuth();
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [posts, setPosts] = useState<PostData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postsLoading, setPostsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Edit form state
	const [editForm, setEditForm] = useState({
		username: "",
		full_name: "",
		headline: "",
		bio: "",
		location: "",
		website_url: "",
	});

	useEffect(() => {
		async function fetchProfile() {
			if (!user) {
				setIsLoading(false);
				return;
			}

			try {
				const { data, error } = await supabaseClient.schema(SUPABASE_SCHEMA).from("profiles").select("*").eq("id", user.id).single();

				if (error) throw error;

				setProfile(data as ProfileData);
				setEditForm({
					username: data.username || "",
					full_name: data.full_name || "",
					headline: data.headline || "",
					bio: data.bio || "",
					location: data.location || "",
					website_url: data.website_url || "",
				});
			} catch (err) {
				console.error("Error fetching profile:", err);
				setError("Failed to load profile");
			} finally {
				setIsLoading(false);
			}
		}

		if (!authLoading) {
			fetchProfile();
		}
	}, [user, authLoading]);

	// Fetch user's posts
	useEffect(() => {
		async function fetchPosts() {
			if (!user) {
				setPostsLoading(false);
				return;
			}

			try {
				const response = await fetch(`/api/posts?authorId=${user.id}&limit=10`);
				const data = await response.json();
				setPosts(data.posts || []);
			} catch (err) {
				console.error("Error fetching posts:", err);
			} finally {
				setPostsLoading(false);
			}
		}

		if (!authLoading && user) {
			fetchPosts();
		}
	}, [user, authLoading]);

	const handleSave = async () => {
		if (!user) return;

		setIsSaving(true);
		setError(null);

		try {
			const { error } = await supabaseClient
				.schema(SUPABASE_SCHEMA)
				.from("profiles")
				.update({
					username: editForm.username || null,
					full_name: editForm.full_name || null,
					headline: editForm.headline || null,
					bio: editForm.bio || null,
					location: editForm.location || null,
					website_url: editForm.website_url || null,
				})
				.eq("id", user.id);

			if (error) throw error;

			// Update local state
			setProfile((prev) =>
				prev
					? {
							...prev,
							...editForm,
					  }
					: null
			);
			setIsEditing(false);
		} catch (err) {
			console.error("Error saving profile:", err);
			setError("Failed to save profile");
		} finally {
			setIsSaving(false);
		}
	};

	if (authLoading || isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
				<User className="h-12 w-12 text-muted-foreground" />
				<h2 className="text-xl font-semibold">Sign in to view your profile</h2>
				<Button asChild>
					<Link href="/login">Sign In</Link>
				</Button>
			</div>
		);
	}

	const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="max-w-3xl mx-auto space-y-6 p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">My Profile</h1>
					<p className="text-sm text-muted-foreground">Manage your profile and contribution settings</p>
				</div>
				{!isEditing && (
					<Button variant="secondary" onClick={() => setIsEditing(true)}>
						<Edit2 className="h-4 w-4 mr-2" />
						Edit Profile
					</Button>
				)}
			</div>

			{error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

			{/* Profile Card */}
			<Card className="border-border/40 bg-card">
				<CardHeader className="pb-4">
					<div className="flex items-start gap-4">
						<Avatar className="h-20 w-20 border-2 border-border/40">
							<AvatarImage src={profile?.avatar_url || undefined} />
							<AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xl">{initials}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							{isEditing ? (
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-3">
										<Input
											placeholder="Username"
											value={editForm.username}
											onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
											className="bg-background/50"
										/>
										<Input
											placeholder="Full Name"
											value={editForm.full_name}
											onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
											className="bg-background/50"
										/>
									</div>
									<Input
										placeholder="Headline (e.g., 'Ancient History Researcher')"
										value={editForm.headline}
										onChange={(e) => setEditForm((prev) => ({ ...prev, headline: e.target.value }))}
										className="bg-background/50"
									/>
								</div>
							) : (
								<>
									<div className="flex items-center gap-2">
										<CardTitle className="text-xl">{displayName}</CardTitle>
										{profile?.is_verified && <CheckCircle2 className="h-5 w-5 text-blue-400 fill-blue-400" />}
									</div>
									{profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
									{profile?.headline && <p className="text-sm text-foreground/80 mt-1">{profile.headline}</p>}
									<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
										<Badge variant="secondary" className="capitalize">
											{profile?.role || "user"}
										</Badge>
										{profile?.created_at && (
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
											</span>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Bio */}
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">About</p>
						{isEditing ? (
							<Textarea
								placeholder="Tell us about yourself and your research interests..."
								value={editForm.bio}
								onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
								rows={3}
								className="bg-background/50"
							/>
						) : (
							<p className="text-sm text-foreground/80">{profile?.bio || "No bio yet. Click Edit Profile to add one."}</p>
						)}
					</div>

					{/* Location & Website */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Location</p>
							{isEditing ? (
								<Input
									placeholder="City, Country"
									value={editForm.location}
									onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
									className="bg-background/50"
								/>
							) : (
								<p className="text-sm flex items-center gap-1.5">
									<MapPin className="h-3.5 w-3.5 text-muted-foreground" />
									{profile?.location || "Not set"}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Website</p>
							{isEditing ? (
								<Input
									placeholder="https://..."
									value={editForm.website_url}
									onChange={(e) => setEditForm((prev) => ({ ...prev, website_url: e.target.value }))}
									className="bg-background/50"
								/>
							) : profile?.website_url ? (
								<a
									href={profile.website_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm flex items-center gap-1.5 text-primary hover:underline"
								>
									<Globe className="h-3.5 w-3.5" />
									{new URL(profile.website_url).hostname}
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								<p className="text-sm text-muted-foreground">Not set</p>
							)}
						</div>
					</div>

					<Separator className="border-border/40" />

					{/* Expertise Tags */}
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Expertise Tags</p>
						{profile?.expertise_tags?.length ? (
							<div className="flex flex-wrap gap-2">
								{profile.expertise_tags.map((tag) => (
									<Badge key={tag} variant="secondary" className="rounded-full">
										{tag}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">No expertise tags yet</p>
						)}
					</div>

					{/* Edit Actions */}
					{isEditing && (
						<div className="flex justify-end gap-3 pt-4">
							<Button
								variant="ghost"
								onClick={() => {
									setIsEditing(false);
									setEditForm({
										username: profile?.username || "",
										full_name: profile?.full_name || "",
										headline: profile?.headline || "",
										bio: profile?.bio || "",
										location: profile?.location || "",
										website_url: profile?.website_url || "",
									});
								}}
							>
								<X className="h-4 w-4 mr-2" />
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Save Changes
									</>
								)}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<div className="grid grid-cols-3 gap-4">
				<Card className="border-border/40 bg-card">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-bold">0</p>
						<p className="text-xs text-muted-foreground">Sites Added</p>
					</CardContent>
				</Card>
				<Card className="border-border/40 bg-card">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-bold">{posts.length}</p>
						<p className="text-xs text-muted-foreground">Posts</p>
					</CardContent>
				</Card>
				<Card className="border-border/40 bg-card">
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-bold">{posts.length}</p>
						<p className="text-xs text-muted-foreground">Contributions</p>
					</CardContent>
				</Card>
			</div>

			{/* Posts Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Posts
					</h2>
					<Button variant="outline" size="sm" asChild>
						<Link href="/contribute">
							<PenLine className="h-4 w-4 mr-1.5" />
							New Post
						</Link>
					</Button>
				</div>

				{postsLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : posts.length > 0 ? (
					<Card className="border-border/40 bg-card overflow-hidden">
						<div className="divide-y divide-border/30">
							{posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					</Card>
				) : (
					<Card className="border-border/40 bg-card">
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<FileText className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-lg font-medium text-muted-foreground mb-2">No posts yet</p>
							<p className="text-sm text-muted-foreground mb-4">Share your research, thoughts, or findings with the community</p>
							<Button asChild>
								<Link href="/contribute">Create your first post</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
