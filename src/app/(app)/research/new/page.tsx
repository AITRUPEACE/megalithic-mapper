"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		router.push("/research");
	};

	return (
		<div className="container mx-auto max-w-2xl py-8 px-4">
			<div className="mb-6">
				<Link href="/research" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Feed
				</Link>
			</div>

			<Card className="border-border/40 bg-card/50 backdrop-blur">
				<CardHeader>
					<h1 className="text-2xl font-bold">Create Research Post</h1>
					<p className="text-sm text-muted-foreground">Share your findings, theories, or field updates with the community.</p>
				</CardHeader>
				<CardContent>
					<form id="new-post-form" onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" placeholder="An interesting title for your finding..." required className="bg-background/50" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="content">Content</Label>
							<Textarea
								id="content"
								placeholder="Describe your finding, theory, or question..."
								className="min-h-[200px] bg-background/50 resize-y font-mono text-sm"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="link">External Link (Optional)</Label>
							<div className="flex gap-2">
								<div className="flex-1">
									<div className="relative">
										<LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input id="link" placeholder="https://" className="pl-9 bg-background/50" />
									</div>
								</div>
							</div>
							<p className="text-[11px] text-muted-foreground">Link to a full report, video, or external article.</p>
						</div>

						<Separator className="border-border/40" />

						<div className="space-y-2">
							<Label>Attachments</Label>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
								<button
									type="button"
									className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-border/60 hover:bg-muted/20 transition-colors"
								>
									<ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
									<span className="text-xs text-muted-foreground">Add Image</span>
								</button>
							</div>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex justify-end gap-3 border-t border-border/40 bg-muted/5 p-4">
					<Button variant="ghost" asChild>
						<Link href="/research">Cancel</Link>
					</Button>
					<Button type="submit" form="new-post-form" disabled={isLoading}>
						{isLoading ? "Publishing..." : "Publish Post"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
