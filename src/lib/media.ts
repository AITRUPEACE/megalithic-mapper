import { nanoid } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type MediaAssetKind,
  type MediaAssetRecord,
  type MediaAttribution,
  type MediaAttachmentDraft,
  type MediaAttachmentTarget,
  type MediaEmbedSource,
  type MediaLinkAttachment,
  type MediaTextAttachment,
  type MediaUploadResult,
} from "@/types/media";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[&#?].*)?/i;
const VIMEO_REGEX = /vimeo\.com\/(?:channels\/\w+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/)?(\d+)/i;
const DEFAULT_BUCKET = "media-assets";

export const detectEmbedSource = (url: string): MediaEmbedSource | null => {
  const trimmed = url.trim();
  const youtubeMatch = trimmed.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    const id = youtubeMatch[1];
    return {
      provider: "youtube",
      id,
      url: trimmed,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeoMatch = trimmed.match(VIMEO_REGEX);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      provider: "vimeo",
      id,
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return {
      provider: "external",
      url: trimmed,
      embedUrl: trimmed,
    };
  }

  return null;
};

export const buildStoragePath = (target: MediaAttachmentTarget, fileName: string) => {
  const safeName = fileName.replace(/\s+/g, "-").toLowerCase();
  return `${target.entityType}/${target.entityId}/${Date.now()}-${safeName}`;
};

export const uploadMediaAsset = async (
  client: SupabaseClient,
  params: {
    file: File | Blob;
    fileName: string;
    bucket?: string;
    target: MediaAttachmentTarget;
    type: MediaAssetKind;
    attribution?: MediaAttribution;
    metadata?: Record<string, unknown>;
    description?: string;
    title: string;
  }
): Promise<MediaUploadResult> => {
  const bucket = params.bucket ?? DEFAULT_BUCKET;
  const storagePath = buildStoragePath(params.target, params.fileName);
  const { error } = await client.storage.from(bucket).upload(storagePath, params.file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;

  const asset: MediaAssetRecord = {
    id: nanoid(12),
    title: params.title,
    description: params.description,
    type: params.type,
    uri: publicUrl,
    thumbnailUrl: publicUrl,
    bucket,
    storagePath,
    attachment: params.target,
    attribution: params.attribution,
    metadata: params.metadata,
    createdAt: new Date().toISOString(),
  };

  return { asset, publicUrl };
};

export const createLinkAttachment = (
  target: MediaAttachmentTarget,
  options: {
    title: string;
    url: string;
    description?: string;
    attribution?: MediaAttribution;
  }
): MediaLinkAttachment => {
  const embed = detectEmbedSource(options.url);
  return {
    id: nanoid(10),
    title: options.title.trim(),
    description: options.description,
    url: options.url.trim(),
    target,
    attribution: options.attribution,
    embed: embed ?? undefined,
    createdAt: new Date().toISOString(),
  };
};

export const createTextAttachment = (
  target: MediaAttachmentTarget,
  options: {
    title: string;
    body: string;
    links?: { label: string; url: string }[];
    attribution?: MediaAttribution;
  }
): MediaTextAttachment => ({
  id: nanoid(10),
  title: options.title.trim(),
  body: options.body.trim(),
  target,
  links: options.links,
  attribution: options.attribution,
  createdAt: new Date().toISOString(),
});

export const canAttachMedia = (draft: MediaAttachmentDraft) => {
  if (!draft.title.trim()) return false;
  if (draft.kind === "text") {
    return Boolean(draft.text && draft.text.trim().length >= 40);
  }
  return Boolean(draft.url && detectEmbedSource(draft.url) !== null);
};

export const normalizeMediaDraft = (
  draft: MediaAttachmentDraft,
  target: MediaAttachmentTarget
): MediaAttachmentDraft => {
  const embed = draft.url ? detectEmbedSource(draft.url) ?? undefined : draft.embed;
  return {
    ...draft,
    id: draft.id || nanoid(8),
    title: draft.title.trim(),
    embed,
    target,
  };
};
