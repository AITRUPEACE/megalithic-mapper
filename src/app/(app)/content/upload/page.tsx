"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useContentStore } from "@/state/content-store";
import { sampleUsers } from "@/data/sample-content";
import { ContentType, ContentData } from "@/lib/types";
import { ArrowLeft, Upload, Image as ImageIcon, Video, Youtube, FileText, File, Link as LinkIcon, MapPin } from "lucide-react";

function ContentUploadPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { addContent } = useContentStore();

	const typeParam = searchParams?.get("type");
	const defaultType = (typeParam === "media" ? "image" : typeParam || "image") as ContentType;
	const [contentType, setContentType] = useState<ContentType>(defaultType);

	// Common fields
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [civilization, setCivilization] = useState("");
	const [era, setEra] = useState("");
	const [tags, setTags] = useState("");
	const [linkedSites, setLinkedSites] = useState<string[]>([]);
	const [siteSearch, setSiteSearch] = useState("");

	// Type-specific fields
	const [imageUrl, setImageUrl] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [youtubeId, setYoutubeId] = useState("");
	const [documentUrl, setDocumentUrl] = useState("");
	const [textBody, setTextBody] = useState("");
	const [linkUrl, setLinkUrl] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	const currentUser = sampleUsers["curator.laila"]; // Mock - get from auth

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Build content data based on type
			let contentData: ContentData;

			switch (contentType) {
				case "image":
					contentData = {
						type: "image" as const,
						data: {
							url: imageUrl,
							thumbnail: imageUrl,
						},
					};
					break;
				case "video":
					contentData = {
						type: "video" as const,
						data: {
							url: videoUrl,
							thumbnail: videoUrl,
						},
					};
					break;
				case "youtube":
					contentData = {
						type: "youtube" as const,
						data: {
							videoId: youtubeId,
							thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
						},
					};
					break;
				case "document":
					contentData = {
						type: "document" as const,
						data: {
							url: documentUrl,
							fileType: "pdf" as const,
						},
					};
					break;
				case "text":
				case "post":
					contentData = {
						type: contentType,
						data: {
							body: textBody,
						},
					};
					break;
				case "link":
					contentData = {
						type: "link" as const,
						data: {
							url: linkUrl,
							domain: new URL(linkUrl).hostname,
						},
					};
					break;
				default:
					throw new Error(`Unsupported content type: ${contentType}`);
			}

			// Create content
			const newContent = addContent({
				type: contentType,
				title,
				description,
				submittedBy: currentUser,
				verificationStatus: "under_review",
				content: contentData,
				linkedSites,
				linkedContent: [],
				tags: tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean),
				civilization: civilization || undefined,
				era: era || undefined,
			});

			// Navigate to the new content
			router.push(`/content/${newContent.id}`);
		} catch (error) {
			console.error("Failed to create content:", error);
			setIsSubmitting(false);
		}
	};

	const addSiteLink = () => {
		if (siteSearch && !linkedSites.includes(siteSearch)) {
			setLinkedSites([...linkedSites, siteSearch]);
			setSiteSearch("");
		}
	};

	const removeSiteLink = (siteId: string) => {
		setLinkedSites(linkedSites.filter((id) => id !== siteId));
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" asChild>
					<Link href="/browse">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-semibold">Upload Content</h1>
					<p className="text-sm text-muted-foreground">Share your discoveries, research, and insights with the community</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				{/* Content Type Selection */}
				<Card className="glass-panel border-border/40 mb-6">
					<CardHeader>
						<CardTitle>Content Type</CardTitle>
						<CardDescription>Select the type of content you want to upload</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs value={contentType} onValueChange={(val) => setContentType(val as ContentType)}>
							<TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
								<TabsTrigger value="image">
									<ImageIcon className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="video">
									<Video className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="youtube">
									<Youtube className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="document">
									<File className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="text">
									<FileText className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="post">
									<FileText className="h-4 w-4" />
								</TabsTrigger>
								<TabsTrigger value="link">
									<LinkIcon className="h-4 w-4" />
								</TabsTrigger>
							</TabsList>

							{/* Type-specific fields */}
							<div className="mt-6">
								<TabsContent value="image" className="space-y-4">
									<div>
										<Label htmlFor="imageUrl">Image URL *</Label>
										<Input
											id="imageUrl"
											placeholder="https://example.com/image.jpg"
											value={imageUrl}
											onChange={(e) => setImageUrl(e.target.value)}
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Direct link to the image file</p>
									</div>
								</TabsContent>

								<TabsContent value="video" className="space-y-4">
									<div>
										<Label htmlFor="videoUrl">Video URL *</Label>
										<Input
											id="videoUrl"
											placeholder="https://example.com/video.mp4"
											value={videoUrl}
											onChange={(e) => setVideoUrl(e.target.value)}
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Direct link to the video file</p>
									</div>
								</TabsContent>

								<TabsContent value="youtube" className="space-y-4">
									<div>
										<Label htmlFor="youtubeId">YouTube Video ID *</Label>
										<Input id="youtubeId" placeholder="dQw4w9WgXcQ" value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)} required />
										<p className="text-xs text-muted-foreground mt-1">
											The ID from the YouTube URL (e.g., youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
										</p>
									</div>
								</TabsContent>

								<TabsContent value="document" className="space-y-4">
									<div>
										<Label htmlFor="documentUrl">Document URL *</Label>
										<Input
											id="documentUrl"
											placeholder="https://example.com/document.pdf"
											value={documentUrl}
											onChange={(e) => setDocumentUrl(e.target.value)}
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Link to PDF, Word document, or other file</p>
									</div>
								</TabsContent>

								<TabsContent value="text" className="space-y-4">
									<div>
										<Label htmlFor="textBody">Text Content *</Label>
										<Textarea
											id="textBody"
											placeholder="Enter your text, translation, or transcription..."
											value={textBody}
											onChange={(e) => setTextBody(e.target.value)}
											className="min-h-[200px]"
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Ancient texts, translations, transcriptions, etc.</p>
									</div>
								</TabsContent>

								<TabsContent value="post" className="space-y-4">
									<div>
										<Label htmlFor="postBody">Post Content *</Label>
										<Textarea
											id="postBody"
											placeholder="Write your research post, analysis, or discussion..."
											value={textBody}
											onChange={(e) => setTextBody(e.target.value)}
											className="min-h-[300px]"
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Research articles, analyses, discussions, etc. Supports markdown.</p>
									</div>
								</TabsContent>

								<TabsContent value="link" className="space-y-4">
									<div>
										<Label htmlFor="linkUrl">External Link *</Label>
										<Input
											id="linkUrl"
											type="url"
											placeholder="https://example.com/article"
											value={linkUrl}
											onChange={(e) => setLinkUrl(e.target.value)}
											required
										/>
										<p className="text-xs text-muted-foreground mt-1">Link to external articles, resources, or websites</p>
									</div>
								</TabsContent>
							</div>
						</Tabs>
					</CardContent>
				</Card>

				{/* Common Fields */}
				<Card className="glass-panel border-border/40 mb-6">
					<CardHeader>
						<CardTitle>Details</CardTitle>
						<CardDescription>Provide information about your content</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								placeholder="Give your content a descriptive title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>

						<div>
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								placeholder="Describe the content and its significance..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="min-h-[100px]"
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="civilization">Civilization</Label>
								<Input
									id="civilization"
									placeholder="e.g., Ancient Egyptian"
									value={civilization}
									onChange={(e) => setCivilization(e.target.value)}
								/>
							</div>

							<div>
								<Label htmlFor="era">Era</Label>
								<Input id="era" placeholder="e.g., Old Kingdom" value={era} onChange={(e) => setEra(e.target.value)} />
							</div>
						</div>

						<div>
							<Label htmlFor="tags">Tags</Label>
							<Input
								id="tags"
								placeholder="archaeology, pyramid, acoustic (comma-separated)"
								value={tags}
								onChange={(e) => setTags(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
						</div>
					</CardContent>
				</Card>

				{/* Site Linking */}
				<Card className="glass-panel border-border/40 mb-6">
					<CardHeader>
						<CardTitle>Link to Sites</CardTitle>
						<CardDescription>Associate this content with specific archaeological sites (optional)</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								placeholder="Enter site ID (e.g., giza-gp)"
								value={siteSearch}
								onChange={(e) => setSiteSearch(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSiteLink())}
							/>
							<Button type="button" onClick={addSiteLink}>
								<MapPin className="mr-2 h-4 w-4" />
								Add
							</Button>
						</div>

						{linkedSites.length > 0 && (
							<div className="space-y-2">
								<Label>Linked Sites</Label>
								<div className="flex flex-wrap gap-2">
									{linkedSites.map((siteId) => (
										<Badge key={siteId} variant="secondary" className="gap-1">
											<MapPin className="h-3 w-3" />
											{siteId}
											<button type="button" onClick={() => removeSiteLink(siteId)} className="ml-1 hover:text-destructive">
												×
											</button>
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit */}
				<Card className="glass-panel border-border/40">
					<CardContent className="pt-6 space-y-4">
						<div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
							<div className="text-sm text-muted-foreground">
								<p className="font-medium text-foreground mb-1">Before you submit:</p>
								<ul className="space-y-1 text-xs">
									<li>• Ensure all information is accurate and well-sourced</li>
									<li>• Check that URLs are accessible and point to the correct resources</li>
									<li>• Your content will be marked as &quot;under review&quot; until verified</li>
									<li>• Community members can comment and rate your submission</li>
								</ul>
							</div>
						</div>

						<div className="flex gap-3">
							<Button 
								type="submit" 
								disabled={!title || !description} 
								loading={isSubmitting}
								loadingText="Uploading..."
								className="flex-1"
							>
								<Upload className="mr-2 h-4 w-4" />
								Submit Content
							</Button>
							<Button type="button" variant="outline" asChild>
								<Link href="/browse">Cancel</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}

export default function ContentUploadPage() {
	return (
		<Suspense fallback={<div className="p-6">Loading...</div>}>
			<ContentUploadPageContent />
		</Suspense>
	);
}
