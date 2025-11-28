export type VerificationStatus = "verified" | "under_review" | "unverified";

export type SiteCategory = "site" | "artifact" | "text";

export type MapLayer = "official" | "community";

export type CommunityTier = "bronze" | "silver" | "gold" | "promoted";

export interface GeographicHierarchy {
  continent: string;
  country: string;
  region?: string;
  zone?: string; // e.g., "Giza Plateau", "Valley of the Kings"
}

export interface MapZone {
  id: string;
  name: string;
  type: "archaeological_zone" | "cultural_region" | "expedition_area";
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  siteCount: number;
  civilizations: string[];
  description?: string;
  minZoom?: number; // Minimum zoom level to show this zone
  maxZoom?: number; // Maximum zoom level to show this zone
  parentZoneId?: string; // Reference to parent zone for hierarchical display
  detailBounds?: {
    // More precise bounds for higher zoom levels
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  summary: string;
  civilization: string;
  era: string;
  category: SiteCategory;
  siteType: string;
  verificationStatus: VerificationStatus;
  layer: MapLayer;
  trustTier?: CommunityTier;
  importance?: "minor" | "moderate" | "major" | "critical"; // For marker sizing
  tags: string[];
  mediaCount: number;
  relatedResearchIds: string[];
  evidenceLinks?: string[];
  lastUpdated: string;
  updatedBy: string;
  geography: GeographicHierarchy;
  zoneId?: string; // Reference to MapZone
}

// ============================================================================
// Research Feed Types
// ============================================================================

export type FeedPostType = "official" | "community";

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: "contribution" | "expert" | "community" | "achievement";
  awardedAt?: string;
}

export interface UserProfile {
  id: string;
  userId?: string; // alias for id compatibility
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatar?: string; // alias for compatibility
  bio?: string; // "About" section
  isVerified: boolean;
  verificationStatus?: VerificationStatus; // compatibility
  title?: string; // e.g. "Archaeologist", "Field Researcher"
  role?: "user" | "contributor" | "researcher" | "expert" | "admin";
  badges?: Badge[];
  stats?: {
    contributions: number;
    followers: number;
    following: number;
  };
}

export interface FeedPost {
  id: string;
  type: FeedPostType;
  author: UserProfile;
  title: string;
  content: string; // Markdown supported
  timestamp: string;
  
  // Media & Links
  media?: {
    type: "image" | "video" | "youtube";
    url: string;
    thumbnail?: string;
    caption?: string;
  }[];
  externalLink?: {
    url: string;
    title: string;
    domain: string; // e.g. "substack.com", "twitter.com"
  };

  // Engagement
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked?: boolean; // for current user context
  
  // Context
  tags: string[];
  relatedSiteIds?: string[]; // Links to map sites
  topicId?: string; // Link to a ResearchTopic
}

export interface ResearchTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  stats: {
    posts: number;
    followers: number;
    contributors: number;
  };
  topContributors: UserProfile[];
  relatedTopics?: string[]; // IDs of other topics
}

export interface FeedComment {
  id: string;
  postId?: string; // Made optional, moving to contentId
  contentId?: string; // Generic content identifier
  parentCommentId?: string; // For threaded replies
  author: UserProfile;
  content: string; // content body
  body?: string; // alias for compatibility
  timestamp: string;
  createdAt?: string; // alias
  likes: number;
  replyCount?: number;
  replies?: FeedComment[]; // Threaded replies
  isDeleted?: boolean;
  isHidden?: boolean;
  isEdited?: boolean;
  flagCount?: number;
}

// Alias for backward compatibility
export type Comment = FeedComment;

export interface Rating {
  id: string;
  contentId: string;
  userId: string;
  user: UserProfile; // Added back for RatingItem
  rating: number; // 1-5
  value?: number; // alias
  review?: string;
  comment?: string;
  timestamp: string;
  createdAt?: string; // alias
  updatedAt?: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

export type ContentType = "post" | "site" | "artifact" | "text" | "media" | "image" | "video" | "youtube" | "document" | "link";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  submittedBy: UserProfile; // Renamed from author
  author?: UserProfile; 
  createdAt: string;
  updatedAt: string;
  tags: string[];
  content: unknown; // Keep flexible for now
  verificationStatus: VerificationStatus;
  trustTier?: CommunityTier;
  civilization?: string;
  era?: string;
  linkedSites: string[];
  stats: {
    likes: number;
    views: number;
    comments: number;
    bookmarks: number;
    shares: number;
    rating: {
      average: number;
      count: number;
    };
  };
}

export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  focusRegions: string[];
  eras: string[];
  status: "active" | "draft" | "archived";
  leadInvestigator: string;
  collaboratorCount: number;
  hypotheses: unknown[]; // Keeping minimal for now as we transition
  linkedEntities: unknown[];
  activity: {
    id: string;
    description: string;
    timestamp: string;
    author: string;
  }[];
}

export type { MediaAsset } from "@/entities/media/model/types";

export type ActivityNotificationType =
  | "mention"
  | "comment"
  | "verification"
  | "research_update"
  | "follow"
  | "system"
  | "like";

export interface ActivityNotification {
  id: string;
  type: ActivityNotificationType;
  summary: string;
  timestamp: string;
  unread: boolean;
  link?: {
    href: string;
    label: string;
  };
}
