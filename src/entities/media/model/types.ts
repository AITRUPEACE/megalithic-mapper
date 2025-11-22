export type MediaAssetType = "image" | "video" | "model" | "document";

export type MediaAssetVisibility = "public" | "team" | "private";

export interface MediaAssetRow {
  id: string;
  site_id: string | null;
  title: string;
  description?: string | null;
  asset_type: MediaAssetType;
  url: string;
  thumbnail_url?: string | null;
  storage_path?: string | null;
  contributor: string;
  civilization?: string | null;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  visibility: MediaAssetVisibility;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  siteId?: string | null;
  title: string;
  description?: string;
  type: MediaAssetType;
  url: string;
  thumbnail?: string;
  storagePath?: string;
  contributor: string;
  civilization?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  visibility: MediaAssetVisibility;
  createdAt: string;
  updatedAt?: string;
}
