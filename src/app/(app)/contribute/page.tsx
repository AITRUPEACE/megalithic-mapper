"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Youtube,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";

type ContributionType = "post" | "site";

interface ExternalLink {
  id: string;
  url: string;
  type: "youtube" | "link";
}

export default function ContributePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContributionType>("post");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post form state
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const addExternalLink = () => {
    if (!newLinkUrl.trim()) return;
    
    const isYouTube = newLinkUrl.includes("youtube.com") || newLinkUrl.includes("youtu.be");
    
    setExternalLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}`,
        url: newLinkUrl.trim(),
        type: isYouTube ? "youtube" : "link",
      },
    ]);
    setNewLinkUrl("");
  };

  const removeLink = (id: string) => {
    setExternalLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postBody.trim()) {
      setError("Please add some content to your post.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim() || null,
          body: postBody.trim(),
          externalLinks: externalLinks.map((l) => l.url),
          postType: "discussion",
          visibility: "public",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create post");
      }

      setSuccess(true);
      setPostTitle("");
      setPostBody("");
      setExternalLinks([]);
      
      // Redirect to feed after short delay
      setTimeout(() => {
        router.push("/activity");
      }, 2000);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold">Contribution Submitted!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your contribution has been submitted. Redirecting to the activity feed...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/map">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Add Contribution</h1>
          <p className="text-sm text-muted-foreground">
            Share research, media, or add new sites to the map
          </p>
        </div>
      </div>

      {/* Contribution Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContributionType)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="post" className="gap-2">
            <FileText className="h-4 w-4" />
            Create Post
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2">
            <MapPin className="h-4 w-4" />
            Add Site
          </TabsTrigger>
        </TabsList>

        {/* Post Creation */}
        <TabsContent value="post" className="mt-4">
          <Card className="border-border/40 bg-[#1a1f26]">
            <CardHeader>
              <CardTitle className="text-lg">Create a Post</CardTitle>
              <CardDescription>
                Share research findings, link YouTube videos, add images, or start a discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                {/* Title (optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (optional)</label>
                  <Input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="bg-background/50"
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content *</label>
                  <Textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="Share your research, thoughts, or findings... Markdown supported."
                    rows={6}
                    className="bg-background/50"
                    required
                  />
                </div>

                {/* External Links */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">External Links</label>
                  <div className="flex gap-2">
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="Paste YouTube URL or link..."
                      className="bg-background/50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExternalLink();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addExternalLink}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {externalLinks.length > 0 && (
                    <div className="space-y-2">
                      {externalLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-background/30 text-sm"
                        >
                          {link.type === "youtube" ? (
                            <Youtube className="h-4 w-4 text-red-400 shrink-0" />
                          ) : (
                            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="flex-1 truncate">{link.url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeLink(link.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/map">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      "Publish Post"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Addition */}
        <TabsContent value="site" className="mt-4">
          <Card className="border-border/40 bg-[#1a1f26]">
            <CardHeader>
              <CardTitle className="text-lg">Add a New Site</CardTitle>
              <CardDescription>
                Add a megalithic or ancient site to the map. Sites go through community review before being verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To add a site, click the <strong>+ Add Site</strong> button on the map, then click on the map to set coordinates.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/map">
                    <MapPin className="h-4 w-4 mr-2" />
                    Go to Map
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t border-border/40">
                <h4 className="font-medium mb-2">What makes a good site submission?</h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Accurate coordinates (click on the map to set)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Clear name and description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Relevant cultural/era tags</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Supporting links or references (optional)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



