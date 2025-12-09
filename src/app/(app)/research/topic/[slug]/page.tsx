import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { sampleTopics } from "@/shared/mocks/research-topics";
import { samplePosts } from "@/shared/mocks/sample-posts";
import { BookOpen, Users, MessageSquare, Plus, ArrowLeft, Share2, ThumbsUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FeedPost } from "@/shared/types/content";

export default async function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = sampleTopics.find((t) => t.slug === slug);

  if (!topic) {
    notFound();
  }

  const topicPosts = samplePosts.filter((p) => p.topicId === topic.id);

  return (
    <div className="min-h-full flex flex-col">
       {/* Hero/Header */}
       <div className="relative h-64 md:h-80 w-full overflow-hidden bg-muted">
          {topic.coverImage && (
              <Image src={topic.coverImage} alt={topic.title} fill className="object-cover" sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
             <div className="max-w-5xl mx-auto">
                <Link href="/research" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Research
                </Link>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{topic.title}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">{topic.description}</p>
             </div>
          </div>
       </div>

       <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Column: Stats & Contributors */}
           <div className="space-y-8 h-fit lg:sticky lg:top-6">
               <Card>
                   <CardHeader>
                       <h3 className="font-semibold">Topic Stats</h3>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div className="flex justify-between items-center">
                           <span className="text-muted-foreground flex items-center gap-2">
                               <BookOpen className="h-4 w-4" /> Posts
                           </span>
                           <span className="font-medium">{topic.stats.posts}</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-muted-foreground flex items-center gap-2">
                               <Users className="h-4 w-4" /> Contributors
                           </span>
                           <span className="font-medium">{topic.stats.contributors}</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-muted-foreground flex items-center gap-2">
                               <Users className="h-4 w-4" /> Followers
                           </span>
                           <span className="font-medium">{topic.stats.followers}</span>
                       </div>
                   </CardContent>
                   <CardFooter>
                       <Button className="w-full">Follow Topic</Button>
                   </CardFooter>
               </Card>

               <div>
                   <h3 className="font-semibold mb-4">Top Contributors</h3>
                   <div className="space-y-3">
                       {topic.topContributors.map(user => (
                           <div key={user.id} className="flex items-center gap-3">
                               <Avatar>
                                   <AvatarImage src={user.avatarUrl} />
                                   <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                               </Avatar>
                               <div>
                                   <p className="font-medium text-sm">{user.displayName}</p>
                                   <p className="text-xs text-muted-foreground">@{user.username}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Right Column: Feed */}
           <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-semibold">Latest Contributions</h2>
                   <Button size="sm">
                       <Plus className="mr-2 h-4 w-4" /> Contribute
                   </Button>
               </div>
               
               {topicPosts.length > 0 ? (
                   <div className="space-y-4">
                       {topicPosts.map(post => (
                           <TopicPostCard key={post.id} post={post} />
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                       <p className="mb-2">No posts yet in this topic.</p>
                       <Button variant="link">Be the first to contribute</Button>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}

function TopicPostCard({ post }: { post: FeedPost }) {
    return (
        <Link href={`/research/${post.id}`} className="block">
            <Card className="overflow-hidden border-border/40 bg-card/50 transition-colors hover:bg-card/80 hover:border-border/60">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4 pb-2">
                    <Avatar>
                        <AvatarImage src={post.author.avatarUrl} />
                        <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{post.author.displayName}</span>
                            {post.author.isVerified && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-primary">
                                    Verified
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">@{post.author.username}</span>
                            <span className="text-xs text-muted-foreground">• 2h ago</span>
                        </div>
                        {post.author.title && <p className="text-xs text-muted-foreground">{post.author.title}</p>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-2">
                    <div>
                        <h3 className="mb-1 text-lg font-semibold leading-none tracking-tight">{post.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
                    </div>

                    {post.externalLink && (
                        <div className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-background">
                                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-primary">{post.externalLink.title}</p>
                                <p className="text-xs text-muted-foreground">{post.externalLink.domain}</p>
                            </div>
                        </div>
                    )}

                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span key={tag} className="text-xs text-primary">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t border-border/40 bg-muted/5 p-2">
                    <div className="flex w-full justify-between px-2">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <MessageSquare className="h-4 w-4" />
                            {post.commentsCount} Comments
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

