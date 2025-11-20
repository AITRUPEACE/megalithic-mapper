"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import type {
  AttachmentDescriptor,
  DiscussionComment,
  DiscussionEntityRef,
  DiscussionThreadSnapshot,
  MentionMetadata,
} from "@/types/discussion";
import { CommentComposer } from "./comment-composer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, timeAgo } from "@/lib/utils";

interface CommentThreadProps {
  snapshot: DiscussionThreadSnapshot;
}

const renderBody = (body: string) => {
  return body
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code class=\"rounded bg-muted px-1\">$1</code>")
    .replace(/\n/g, "<br />");
};

const MentionBadges = ({ mentions }: { mentions: MentionMetadata[] }) => (
  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
    {mentions.map((item) => (
      <Badge key={`${item.mention.id}-${item.location.start}`} variant="outline">
        @{item.mention.handle ?? item.mention.displayName}
      </Badge>
    ))}
  </div>
);

const AttachmentList = ({ attachments }: { attachments: AttachmentDescriptor[] }) => {
  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              attachment.type === "image" && "bg-blue-400",
              attachment.type === "video" && "bg-amber-400",
              attachment.type === "document" && "bg-emerald-400",
              attachment.type === "link" && "bg-purple-400"
            )}
          />
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground">{attachment.name}</div>
            {attachment.size && <div className="text-[11px] text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CommentThread = ({ snapshot }: CommentThreadProps) => {
  const [comments, setComments] = useState<DiscussionComment[]>(snapshot.comments);
  const [unreadCount, setUnreadCount] = useState(snapshot.unreadCount);
  const optimisticAuthors = useMemo(
    () =>
      comments.reduce<Record<string, { id: string; displayName: string; handle?: string }>>(
        (accumulator, current) => {
          accumulator[current.id] = {
            id: current.authorId,
            displayName: snapshot.participants.find((participant) => participant.id === current.authorId)?.displayName ??
              current.authorId,
            handle: snapshot.participants.find((participant) => participant.id === current.authorId)?.handle,
          };
          return accumulator;
        },
        {}
      ),
    [comments, snapshot.participants]
  );

  const entityRef: DiscussionEntityRef = snapshot.thread.entityRef;

  const persistMentions = async (mentions: MentionMetadata[], commentId: string) => {
    if (!mentions.length) return;

    try {
      await fetch("/api/mentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: snapshot.thread.id,
          entityRef,
          mentions: mentions.map((item) => item.mention),
          participantIds: snapshot.participants.map((participant) => participant.id),
          actorId: snapshot.thread.authorId,
          commentId,
        }),
      });
    } catch (error) {
      console.error("Unable to queue mention fan-out", error);
    }
  };

  const handleSubmit = async ({
    body,
    attachments,
    mentions,
    parentId,
  }: {
    body: string;
    attachments: AttachmentDescriptor[];
    mentions: MentionMetadata[];
    parentId?: string;
  }) => {
    const optimisticId = `temp-${nanoid(6)}`;
    const comment: DiscussionComment = {
      id: optimisticId,
      threadId: snapshot.thread.id,
      parentId: parentId ?? snapshot.thread.id,
      entityRef,
      authorId: "current-user",
      body,
      markdownEnabled: true,
      attachments,
      reactionCounters: [],
      mentions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyCount: 0,
    };

    setComments((prev) => [...prev, comment]);
    setUnreadCount((prev) => prev + 1);

    await persistMentions(mentions, optimisticId);

    return comment;
  };

  const topLevelComments = comments.filter((comment) => comment.parentId === snapshot.thread.id);
  const childComments = comments.filter((comment) => comment.parentId !== snapshot.thread.id);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/70">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">{snapshot.thread.title}</CardTitle>
              <p className="text-xs text-muted-foreground">Updated {timeAgo(snapshot.thread.updatedAt)}</p>
            </div>
            <Badge variant="secondary">{unreadCount} unread</Badge>
          </div>
          <MentionBadges mentions={snapshot.thread.mentions} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div dangerouslySetInnerHTML={{ __html: renderBody(snapshot.thread.body) }} />
          <AttachmentList attachments={snapshot.thread.attachments} />
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {snapshot.thread.reactionCounters.map((reaction) => (
              <Badge key={reaction.kind} variant="outline">
                {reaction.kind} • {reaction.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="space-y-3 rounded-xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reply by {comment.authorId}</span>
              <span>{timeAgo(comment.createdAt)}</span>
            </div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderBody(comment.body) }} />
            <MentionBadges mentions={comment.mentions} />
            <AttachmentList attachments={comment.attachments} />

            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {comment.reactionCounters.length === 0 && <span>No reactions yet</span>}
              {comment.reactionCounters.map((reaction) => (
                <Badge key={reaction.kind} variant="outline">
                  {reaction.kind} • {reaction.count}
                </Badge>
              ))}
            </div>

            <Separator className="border-border/40" />

            <CommentComposer
              threadId={snapshot.thread.id}
              parentId={comment.id}
              entityRef={entityRef}
              onSubmit={handleSubmit}
              optimisticAuthors={optimisticAuthors}
            />

            {childComments
              .filter((child) => child.parentId === comment.id)
              .map((child) => (
                <div key={child.id} className="space-y-2 rounded-lg border border-border/40 bg-background/60 p-3 text-sm">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Reply chain by {child.authorId}</span>
                    <span>{timeAgo(child.createdAt)}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderBody(child.body) }} />
                  <MentionBadges mentions={child.mentions} />
                  <AttachmentList attachments={child.attachments} />
                </div>
              ))}
          </div>
        ))}
      </div>

      <Card className="border-dashed border-primary/40 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add a new reply</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentComposer threadId={snapshot.thread.id} entityRef={entityRef} onSubmit={handleSubmit} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/60 p-3 text-xs text-muted-foreground">
        <div>
          {snapshot.participants.length} participants • {comments.length} messages • {unreadCount} unread
        </div>
        <Button variant="ghost" size="sm">
          Mark unread cleared
        </Button>
      </div>
    </div>
  );
};
