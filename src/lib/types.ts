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
  lastUpdated: string;
  updatedBy: string;
  geography: GeographicHierarchy;
  zoneId?: string; // Reference to MapZone
}

export type HypothesisStatus = "proposed" | "under_review" | "validated" | "deprecated";

export interface ResearchHypothesis {
  id: string;
  title: string;
  statement: string;
  status: HypothesisStatus;
  confidence: "speculative" | "plausible" | "supported";
  evidenceCount: number;
  lastUpdated: string;
}

export interface LinkedEntity {
  id: string;
  type: "site" | "artifact" | "text" | "figure" | "media";
  name: string;
  relation: string;
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
  hypotheses: ResearchHypothesis[];
  linkedEntities: LinkedEntity[];
  activity: {
    id: string;
    description: string;
    timestamp: string;
    author: string;
  }[];
}

export interface DiscussionThread {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  lastUpdated: string;
  replies: number;
  tags: string[];
  isVerifiedOnly?: boolean;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  contributor: string;
  civilization: string;
  tags: string[];
  createdAt: string;
}

export interface TextSource {
  id: string;
  title: string;
  author: string;
  civilization: string;
  era: string;
  language: string;
  summary: string;
  tags: string[];
  downloadUrl?: string;
}

export interface ActivityNotification {
  id: string;
  type:
    | "mention"
    | "verification"
    | "research_update"
    | "comment"
    | "system";
  summary: string;
  timestamp: string;
  unread: boolean;
  link?: {
    href: string;
    label: string;
  };
}

// ============================================================================
// Enhanced Content Management System
// ============================================================================

export type ContentType = 
  | "site" 
  | "image" 
  | "video" 
  | "youtube" 
  | "document" 
  | "text" 
  | "post" 
  | "link";

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  verificationStatus: VerificationStatus;
  bio?: string;
  affiliation?: string;
}

export interface ContentStats {
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
  shares: number;
  rating: {
    average: number; // 0-5 stars
    count: number;
  };
}

// Content-specific data types
export interface ImageData {
  url: string;
  thumbnail: string;
  width?: number;
  height?: number;
  format?: string;
  source?: string;
  license?: string;
}

export interface VideoData {
  url: string;
  thumbnail: string;
  duration?: number;
  format?: string;
  source?: string;
}

export interface YoutubeData {
  videoId: string;
  thumbnail: string;
  duration?: number;
  channelName?: string;
  channelId?: string;
}

export interface DocumentData {
  url: string;
  fileType: "pdf" | "doc" | "docx" | "txt" | "other";
  fileSize?: number;
  pages?: number;
  author?: string;
  language?: string;
}

export interface TextData {
  body: string;
  author?: string;
  originalLanguage?: string;
  translatedBy?: string;
  sourceReference?: string;
}

export interface PostData {
  body: string;
  featuredImage?: string;
  category?: string;
}

export interface LinkData {
  url: string;
  domain: string;
  favicon?: string;
  preview?: {
    title: string;
    description: string;
    image?: string;
  };
}

export type ContentData = 
  | { type: "image"; data: ImageData }
  | { type: "video"; data: VideoData }
  | { type: "youtube"; data: YoutubeData }
  | { type: "document"; data: DocumentData }
  | { type: "text"; data: TextData }
  | { type: "post"; data: PostData }
  | { type: "link"; data: LinkData };

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  
  // Attribution
  submittedBy: UserProfile;
  createdAt: string;
  updatedAt: string;
  
  // Verification & Trust
  verificationStatus: VerificationStatus;
  trustTier?: CommunityTier;
  
  // Content specifics
  content: ContentData;
  
  // Relationships
  linkedSites: string[]; // Site IDs this is linked to
  linkedContent: string[]; // Other content items
  tags: string[];
  
  // Metadata
  civilization?: string;
  era?: string;
  geography?: Partial<GeographicHierarchy>;
  
  // Engagement
  stats: ContentStats;
}

export type RelationshipType =
  | "attached_to"
  | "references"
  | "depicts"
  | "discusses"
  | "supplements"
  | "contradicts"
  | "supports"
  | "part_of"
  | "related";

export interface ContentRelationship {
  id: string;
  fromContentId: string;
  toContentId: string;
  relationshipType: RelationshipType;
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  contentId: string;
  parentCommentId?: string;
  
  author: UserProfile;
  
  body: string;
  createdAt: string;
  updatedAt?: string;
  
  // Engagement
  likes: number;
  isEdited: boolean;
  
  // Moderation
  isHidden: boolean;
  isDeleted: boolean;
  flagCount: number;
  
  // Threading
  replies: Comment[];
  replyCount: number;
}

export interface Rating {
  id: string;
  contentId: string;
  user: UserProfile;
  rating: number; // 1-5 stars
  review?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;
}

export type UserActionType = "like" | "bookmark" | "flag" | "share" | "view";

export interface UserAction {
  id: string;
  userId: string;
  contentId: string;
  actionType: UserActionType;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ContentCollection {
  id: string;
  title: string;
  description: string;
  
  creator: UserProfile;
  
  contentIds: string[];
  isPublic: boolean;
  isCollaborative: boolean;
  
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Stats
  followerCount: number;
  itemCount: number;
}