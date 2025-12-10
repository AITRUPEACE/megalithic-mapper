/**
 * Social Features Types
 * 
 * Types for posts, comments, reactions, notifications, and bookmarks.
 * These complement the auto-generated database.types.ts
 */

// ============================================================================
// ENUMS / CONSTANTS
// ============================================================================

export const POST_TYPES = ['discussion', 'research', 'update', 'question', 'announcement'] as const;
export type PostType = typeof POST_TYPES[number];

export const VISIBILITY_OPTIONS = ['public', 'followers', 'private', 'draft'] as const;
export type Visibility = typeof VISIBILITY_OPTIONS[number];

export const BODY_FORMATS = ['markdown', 'html', 'plain'] as const;
export type BodyFormat = typeof BODY_FORMATS[number];

export const TARGET_TYPES = ['post', 'comment', 'site', 'media', 'zone'] as const;
export type TargetType = typeof TARGET_TYPES[number];

export const REACTION_TYPES = ['like', 'love', 'insightful', 'helpful', 'bookmark'] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export const NOTIFICATION_TYPES = [
  'follow', 'follow_request', 'follow_accepted',
  'like', 'comment', 'reply', 'mention',
  'badge', 'site_update', 'post_published',
  'system'
] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export const FOLLOW_STATUSES = ['pending', 'accepted', 'rejected', 'blocked'] as const;
export type FollowStatus = typeof FOLLOW_STATUSES[number];

export const ROLE_SLUGS = ['user', 'contributor', 'researcher', 'expert', 'admin'] as const;
export type RoleSlug = typeof ROLE_SLUGS[number];

// ============================================================================
// LOOKUP TABLES
// ============================================================================

export interface Role {
  slug: RoleSlug;
  name: string;
  description: string | null;
  permissions: RolePermissions;
  color: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface RolePermissions {
  canComment?: boolean;
  canAddSites?: boolean;
  canAddMedia?: boolean;
  canEditSites?: boolean;
  canVerify?: boolean;
  canModerate?: boolean;
  canManageUsers?: boolean;
}

export interface SiteType {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: 'culture' | 'era' | 'technique' | 'material' | 'theme' | 'expertise' | null;
  usage_count: number;
  created_at: string;
}

// ============================================================================
// POSTS
// ============================================================================

export interface PostRow {
  id: string;
  author_id: string;
  target_type: 'site' | 'zone' | 'general' | 'research' | null;
  target_id: string | null;
  title: string | null;
  body: string;
  body_format: BodyFormat;
  excerpt: string | null;
  media_ids: string[];
  post_type: PostType;
  visibility: Visibility;
  is_pinned: boolean;
  allow_comments: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted_at: string | null;
}

export interface PostInsert {
  author_id: string;
  target_type?: 'site' | 'zone' | 'general' | 'research' | null;
  target_id?: string | null;
  title?: string | null;
  body: string;
  body_format?: BodyFormat;
  excerpt?: string | null;
  media_ids?: string[];
  post_type?: PostType;
  visibility?: Visibility;
  is_pinned?: boolean;
  allow_comments?: boolean;
  published_at?: string | null;
}

export interface PostUpdate {
  title?: string | null;
  body?: string;
  body_format?: BodyFormat;
  excerpt?: string | null;
  media_ids?: string[];
  post_type?: PostType;
  visibility?: Visibility;
  is_pinned?: boolean;
  allow_comments?: boolean;
  published_at?: string | null;
  deleted_at?: string | null;
}

/** Post with author profile joined */
export interface PostWithAuthor extends PostRow {
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: RoleSlug;
    is_verified: boolean;
  };
}

/** Post with full details for display */
export interface PostDetail extends PostWithAuthor {
  target?: {
    type: 'site' | 'zone';
    id: string;
    name: string;
    slug: string;
  } | null;
  user_reaction?: ReactionType | null;
  is_bookmarked?: boolean;
}

// ============================================================================
// COMMENTS
// ============================================================================

export interface CommentRow {
  id: string;
  author_id: string;
  target_type: 'post' | 'site' | 'media';
  target_id: string;
  parent_id: string | null;
  root_id: string | null;
  depth: number;
  body: string;
  likes_count: number;
  is_hidden: boolean;
  hidden_reason: string | null;
  hidden_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CommentInsert {
  author_id: string;
  target_type: 'post' | 'site' | 'media';
  target_id: string;
  parent_id?: string | null;
  body: string;
}

export interface CommentUpdate {
  body?: string;
  is_hidden?: boolean;
  hidden_reason?: string | null;
  deleted_at?: string | null;
}

/** Comment with author profile joined */
export interface CommentWithAuthor extends CommentRow {
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: RoleSlug;
    is_verified: boolean;
  };
}

/** Threaded comment with replies */
export interface CommentThread extends CommentWithAuthor {
  replies: CommentThread[];
  user_liked?: boolean;
}

// ============================================================================
// REACTIONS
// ============================================================================

export interface ReactionRow {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionInsert {
  user_id: string;
  target_type: TargetType;
  target_id: string;
  reaction_type?: ReactionType;
}

/** Reaction with user info for "who liked this" */
export interface ReactionWithUser extends ReactionRow {
  user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

/** Aggregated reaction counts */
export interface ReactionCounts {
  like: number;
  love: number;
  insightful: number;
  helpful: number;
  total: number;
}

// ============================================================================
// FOLLOWS
// ============================================================================

export interface FollowRow {
  follower_id: string;
  following_id: string;
  status: FollowStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface FollowInsert {
  follower_id: string;
  following_id: string;
  status?: FollowStatus;
  message?: string | null;
}

export interface FollowUpdate {
  status?: FollowStatus;
  responded_at?: string | null;
}

/** Follow request with user info */
export interface FollowRequest extends FollowRow {
  requester: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string | null;
  target_type: string | null;
  target_id: string | null;
  title: string;
  body: string | null;
  image_url: string | null;
  action_url: string | null;
  group_key: string | null;
  is_read: boolean;
  read_at: string | null;
  is_seen: boolean;
  seen_at: string | null;
  created_at: string;
}

export interface NotificationInsert {
  user_id: string;
  type: NotificationType;
  actor_id?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  title: string;
  body?: string | null;
  image_url?: string | null;
  action_url?: string | null;
  group_key?: string | null;
}

/** Notification with actor info */
export interface NotificationWithActor extends NotificationRow {
  actor: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/** Grouped notifications ("X and 5 others liked your post") */
export interface GroupedNotification {
  group_key: string;
  type: NotificationType;
  title: string;
  body: string | null;
  action_url: string | null;
  actors: Array<{
    id: string;
    username: string | null;
    avatar_url: string | null;
  }>;
  count: number;
  latest_at: string;
  is_read: boolean;
}

// ============================================================================
// BOOKMARKS
// ============================================================================

export interface BookmarkRow {
  id: string;
  user_id: string;
  target_type: 'site' | 'post' | 'media' | 'zone';
  target_id: string;
  collection: string | null;
  notes: string | null;
  created_at: string;
}

export interface BookmarkInsert {
  user_id: string;
  target_type: 'site' | 'post' | 'media' | 'zone';
  target_id: string;
  collection?: string | null;
  notes?: string | null;
}

export interface BookmarkUpdate {
  collection?: string | null;
  notes?: string | null;
}

/** Bookmark with target details */
export interface BookmarkWithTarget extends BookmarkRow {
  target: {
    name: string;
    slug?: string;
    thumbnail_url?: string | null;
    excerpt?: string | null;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Feed response with cursor pagination */
export interface FeedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Notification badge counts */
export interface NotificationCounts {
  unread: number;
  unseen: number;
  byType: Partial<Record<NotificationType, number>>;
}

/** User engagement stats */
export interface EngagementStats {
  posts_count: number;
  comments_count: number;
  likes_given: number;
  likes_received: number;
  followers_count: number;
  following_count: number;
}

// ============================================================================
// FORM TYPES (for UI)
// ============================================================================

export interface CreatePostForm {
  title?: string;
  body: string;
  bodyFormat?: BodyFormat;
  postType?: PostType;
  visibility?: Visibility;
  targetType?: 'site' | 'zone' | null;
  targetId?: string | null;
  mediaIds?: string[];
  publishNow?: boolean;
}

export interface CreateCommentForm {
  body: string;
  parentId?: string | null;
}

export interface UpdateProfileForm {
  username?: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website_url?: string;
  expertise_tags?: string[];
}
















