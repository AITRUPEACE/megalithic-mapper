export type DiscussionEntityRef = {
  siteId?: string;
  zoneId?: string;
  researchId?: string;
};

export type ReactionKind = "insight" | "appreciate" | "question" | "flag";

export interface ReactionCounter {
  kind: ReactionKind;
  count: number;
}

export interface AttachmentDescriptor {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "link";
  url?: string;
  size?: number;
  previewUrl?: string;
}

export interface MentionTarget {
  id: string;
  displayName: string;
  handle?: string;
  avatarUrl?: string | null;
}

export interface MentionMetadata {
  mention: MentionTarget;
  location: {
    start: number;
    end: number;
  };
  reason: "mention" | "reply" | "participant";
}

export interface BaseDiscussionRecord {
  id: string;
  threadId: string;
  parentId: string | null;
  entityRef: DiscussionEntityRef;
  authorId: string;
  body: string;
  markdownEnabled: boolean;
  attachments: AttachmentDescriptor[];
  reactionCounters: ReactionCounter[];
  mentions: MentionMetadata[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionPost extends BaseDiscussionRecord {
  parentId: null;
  title: string;
  totalReplies: number;
}

export interface DiscussionComment extends BaseDiscussionRecord {
  parentId: string;
  replyCount: number;
}

export interface DiscussionThreadSnapshot {
  thread: DiscussionPost;
  comments: DiscussionComment[];
  participants: MentionTarget[];
  unreadCount: number;
}

export interface NotificationFanoutPayload {
  threadId: string;
  entityRef: DiscussionEntityRef;
  mentions: MentionTarget[];
  participantIds: string[];
  actorId: string;
  commentId: string;
}
