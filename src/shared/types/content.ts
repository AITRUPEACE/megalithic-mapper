export type VerificationStatus = "verified" | "under_review" | "unverified";

export type SiteCategory = "site" | "artifact" | "text";

export type MapLayer = "official" | "community";

export type CommunityTier = "bronze" | "silver" | "gold" | "promoted";

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
  tags: string[];
  mediaCount: number;
  relatedResearchIds: string[];
  evidenceLinks?: string[];
  lastUpdated: string;
  updatedBy: string;
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

export type { MediaAsset } from "@/entities/media/model/types";
