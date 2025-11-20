export type MediaAssetType = "image" | "video" | "document" | "external_video" | "link" | "text";
export type MediaAttachmentTargetType = "site" | "zone" | "artifact" | "expedition" | "text";

export interface MediaAttachmentTarget {
  entityType: MediaAttachmentTargetType;
  entityId: string;
}

export interface MediaAttribution {
  author?: string;
  sourceUrl?: string;
  license?: string;
  notes?: string;
}

export interface MediaAsset {
  id: string;
  type: MediaAssetType;
  uri: string;
  storagePath?: string | null;
  title?: string | null;
  description?: string | null;
  attribution?: MediaAttribution | null;
  mimeType?: string | null;
  previewImage?: string | null;
  target: MediaAttachmentTarget;
  createdAt: string;
}

export interface MediaUploadRequest {
  file: File | Blob;
  fileName?: string;
  target: MediaAttachmentTarget;
  title?: string;
  description?: string;
  attribution?: MediaAttribution | string;
}

export interface ExternalVideoValidation {
  isValid: boolean;
  provider?: "youtube" | "vimeo";
  embedUrl?: string;
}
