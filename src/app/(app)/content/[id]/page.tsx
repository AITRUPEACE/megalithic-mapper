"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CommentThread } from "@/components/content/comment-thread";
import { RatingSection } from "@/components/content/rating-section";
import { useContentStore, getContentById, getCommentsForContent, getRatingsForContent } from "@/state/content-store";
import { sampleUsers } from "@/data/sample-content";
import { ContentItem } from "@/lib/types";
import {
	Heart,
	Bookmark,
	Share2,
	MapPin,
	VerifiedIcon,
	ArrowLeft,
	ExternalLink,
	Download,
	FileText,
	Image as ImageIcon,
	Video,
	Youtube,
	File,
	Link as LinkIcon,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

function getContentIcon(type: string) {
  switch (type) {
    case "image": return ImageIcon;
    case "video": return Video;
    case "youtube": return Youtube;
    case "document": return File;
    case "text": return FileText;
    case "post": return FileText;
    case "link": return LinkIcon;
    default: return FileText;
  }
}

function getThumbnail(content: ContentItem): string | null {
  switch (content.content.type) {
    case "image":
      return content.content.data.url;
    case "video":
      return content.content.data.thumbnail;
    case "youtube":
      return content.content.data.thumbnail;
    case "link":
      return content.content.data.preview?.image || null;
    case "post":
      return content.content.data.featuredImage || null;
    default:
      return null;
  }
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    contentItems,
    comments,
    ratings,
    likeContent,
    bookmarkContent,
    shareContent,
    viewContent,
    addComment,
    likeComment,
    addOrUpdateRating,
    markRatingHelpful,
  } = useContentStore();

  const content = getContentById(contentItems, id);
  const contentComments = getCommentsForContent(comments, id);
  const contentRatings = getRatingsForContent(ratings, id);

  if (!content) {
    notFound();
  }

  // Mock current user - in real app, get from auth context
  const currentUser = sampleUsers["curator.laila"];
  const userRating = contentRatings.find(r => r.user.userId === currentUser.userId);

  const ContentIcon = getContentIcon(content.type);
  const thumbnail = getThumbnail(content);

  // Related content (same civilization or linked sites)
  const relatedContent = contentItems.filter(item => 
    item.id !== content.id && 
    (item.civilization === content.civilization ||
     item.linkedSites.some(siteId => content.linkedSites.includes(siteId)))
  ).slice(0, 3);

  const handleLike = () => {
    likeContent(content.id, currentUser.userId);
    viewContent(content.id, currentUser.userId);
  };

  const handleBookmark = () => {
    bookmarkContent(content.id, currentUser.userId);
  };

  const handleShare = () => {
    shareContent(content.id, currentUser.userId);
    // In real app, open share dialog or copy link
    navigator.clipboard.writeText(`${window.location.origin}/content/${content.id}`);
  };

  const handleAddComment = (body: string) => {
    addComment({
      contentId: content.id,
      author: currentUser,
      body,
    });
  };

  const handleReply = (commentId: string, body: string) => {
    addComment({
      contentId: content.id,
      parentCommentId: commentId,
      author: currentUser,
      body,
    });
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId, currentUser.userId);
  };

  const handleSubmitRating = (rating: number, review?: string) => {
    addOrUpdateRating({
      contentId: content.id,
      user: currentUser,
      rating,
      review,
    });
  };

  const handleMarkHelpful = (ratingId: string, helpful: boolean) => {
    markRatingHelpful(ratingId, helpful);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/browse">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Link>
      </Button>

      {/* Hero Section */}
      {thumbnail && (
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <Image
            src={thumbnail}
            alt={content.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Overlays */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/60 text-xs uppercase tracking-wide backdrop-blur-sm">
              <ContentIcon className="mr-1 h-3 w-3" />
              {content.type}
            </Badge>
            {content.verificationStatus === "verified" && (
              <Badge className="bg-green-600/80 text-xs backdrop-blur-sm">
                <VerifiedIcon className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
            {content.trustTier && (
              <Badge className="bg-purple-600/80 text-xs uppercase backdrop-blur-sm">
                {content.trustTier}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl font-bold text-white mb-2">{content.title}</h1>
            <p className="text-gray-200 text-lg">{content.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title (if no thumbnail) */}
          {!thumbnail && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ContentIcon className="h-6 w-6" />
                <Badge variant={content.verificationStatus === "verified" ? "default" : "secondary"}>
                  {content.verificationStatus}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
              <p className="text-lg text-muted-foreground">{content.description}</p>
            </div>
          )}

          {/* Content Body (for text/post types) */}
          {content.content.type === "text" && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {content.content.data.body}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {content.content.type === "post" && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <div className="text-sm whitespace-pre-wrap">
                    {content.content.data.body}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTube Embed */}
          {content.content.type === "youtube" && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${content.content.data.videoId}`}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {/* External Link */}
          {content.content.type === "link" && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6">
                <Button asChild className="w-full">
                  <a href={content.content.data.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit {content.content.data.domain}
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Document Download */}
          {content.content.type === "document" && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Document Details</p>
                    <p className="text-xs text-muted-foreground">
                      {content.content.data.fileType.toUpperCase()} 
                      {content.content.data.pages && ` • ${content.content.data.pages} pages`}
                      {content.content.data.fileSize && ` • ${(content.content.data.fileSize / 1024 / 1024).toFixed(1)} MB`}
                    </p>
                  </div>
                  <Button asChild>
                    <a href={content.content.data.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Ratings Section */}
          <RatingSection
            ratings={contentRatings}
            averageRating={content.stats.rating.average}
            totalRatings={content.stats.rating.count}
            userRating={userRating}
            onSubmitRating={handleSubmitRating}
            onMarkHelpful={handleMarkHelpful}
            currentUserId={currentUser.userId}
          />

          <Separator />

          {/* Comments Section */}
          <CommentThread
            comments={contentComments}
            onAddComment={handleAddComment}
            onReply={handleReply}
            onLike={handleLikeComment}
            currentUserId={currentUser.userId}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submitter Info */}
          <Card className="glass-panel border-border/40">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Submitted By</h3>
              <Link 
                href={`/profile/${content.submittedBy.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={content.submittedBy.avatar} />
                  <AvatarFallback>{content.submittedBy.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-1">
                    {content.submittedBy.displayName}
                    {content.submittedBy.verificationStatus === "verified" && (
                      <VerifiedIcon className="h-4 w-4 text-blue-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{content.submittedBy.username}
                  </p>
                </div>
              </Link>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Submitted {timeAgo(content.createdAt)}</p>
                {content.updatedAt !== content.createdAt && (
                  <p>Updated {timeAgo(content.updatedAt)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="glass-panel border-border/40">
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full" onClick={handleLike}>
                <Heart className="mr-2 h-4 w-4" />
                Like ({content.stats.likes})
              </Button>
              <Button variant="outline" className="w-full" onClick={handleBookmark}>
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmark ({content.stats.bookmarks})
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share ({content.stats.shares})
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="glass-panel border-border/40">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{content.stats.views}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Comments</span>
                <span className="font-medium">{content.stats.comments}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">
                  {content.stats.rating.average.toFixed(1)} ({content.stats.rating.count})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="glass-panel border-border/40">
            <CardContent className="pt-6 space-y-3">
              {content.civilization && (
                <div>
                  <p className="text-xs text-muted-foreground">Civilization</p>
                  <p className="text-sm font-medium">{content.civilization}</p>
                </div>
              )}
              {content.era && (
                <div>
                  <p className="text-xs text-muted-foreground">Era</p>
                  <p className="text-sm font-medium">{content.era}</p>
                </div>
              )}
              {content.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Sites */}
          {content.linkedSites.length > 0 && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h3 className="font-semibold">Linked Sites</h3>
                </div>
                <div className="space-y-2">
                  {content.linkedSites.map((siteId) => (
                    <Button key={siteId} variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/map?site=${siteId}`}>
                        {siteId}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Content */}
          {relatedContent.length > 0 && (
            <Card className="glass-panel border-border/40">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Related Content</h3>
                <div className="space-y-3">
                  {relatedContent.map((item) => (
                    <Link
                      key={item.id}
                      href={`/content/${item.id}`}
                      className="block rounded-lg border border-border/40 p-3 hover:bg-card/90 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.type} • {item.submittedBy.displayName}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

