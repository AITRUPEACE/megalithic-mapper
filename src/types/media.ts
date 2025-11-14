export type MediaAssetKind = "image" | "video" | "audio" | "document";

export type MediaAttachmentKind = MediaAssetKind | "link" | "text";

export type MediaAttachmentTargetType = "site" | "artifact" | "text" | "expedition" | "zone";

export interface MediaAttachmentTarget {
  entityType: MediaAttachmentTargetType;
  entityId: string;
}

export interface MediaAttribution {
  contributorName?: string;
  contributorHandle?: string;
  sourceUrl?: string;
  license?: string;
  capturedAt?: string;
  creditLine?: string;
}

export interface MediaEmbedSource {
  provider: "youtube" | "vimeo" | "external";
  id?: string;
  url: string;
  embedUrl: string;
  thumbnailUrl?: string;
}

export interface MediaAssetRecord {
  id: string;
  title: string;
  description?: string;
  type: MediaAssetKind;
  uri: string;
  thumbnailUrl?: string;
  bucket?: string;
  storagePath?: string;
  attachment: MediaAttachmentTarget;
  attribution?: MediaAttribution;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
}

export interface MediaLinkAttachment {
  id: string;
  title: string;
  description?: string;
  url: string;
  target: MediaAttachmentTarget;
  attribution?: MediaAttribution;
  embed?: MediaEmbedSource;
  createdAt: string;
}

export interface MediaTextAttachment {
  id: string;
  title: string;
  body: string;
  target: MediaAttachmentTarget;
  links?: { label: string; url: string }[];
  createdAt: string;
  attribution?: MediaAttribution;
}

export interface MediaUploadResult {
  asset: MediaAssetRecord;
  publicUrl: string;
}

export interface MediaAttachmentDraft {
  id: string;
  kind: MediaAttachmentKind;
  title: string;
  url?: string;
  text?: string;
  type?: MediaAssetKind;
  embed?: MediaEmbedSource;
  target?: MediaAttachmentTarget;
}
