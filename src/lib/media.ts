import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import type {
  ExternalVideoValidation,
  MediaAsset,
  MediaAssetType,
  MediaAttribution,
  MediaAttachmentTarget,
  MediaUploadRequest,
} from "@/types/media";

const MEDIA_BUCKET_ID = "media-assets";

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing for media uploads.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
};

export const normalizeAttribution = (value?: MediaAttribution | string | null): MediaAttribution | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") {
    return { author: value } satisfies MediaAttribution;
  }
  return Object.values(value).some(Boolean) ? value : undefined;
};

const buildStoragePath = (fileName: string, target: MediaAttachmentTarget) => {
  const normalizedName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const uniqueName = `${Date.now()}-${nanoid(6)}-${normalizedName}`;
  return `${target.entityType}/${target.entityId}/${uniqueName}`;
};

const guessMediaType = (mimeType?: string): MediaAssetType => {
  if (!mimeType) return "document";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "text/plain") return "text";
  return "document";
};

export const validateExternalVideoUrl = (url: string): ExternalVideoValidation => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const videoId = parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).pop();
      if (!videoId) return { isValid: false };
      return {
        isValid: true,
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      } satisfies ExternalVideoValidation;
    }

    if (host.includes("vimeo.com")) {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const videoId = segments.pop();
      if (!videoId) return { isValid: false };
      return {
        isValid: true,
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
      } satisfies ExternalVideoValidation;
    }
  } catch (error) {
    console.warn("Invalid video URL", error);
    return { isValid: false } satisfies ExternalVideoValidation;
  }

  return { isValid: false } satisfies ExternalVideoValidation;
};

export const uploadMediaAsset = async (
  request: MediaUploadRequest,
  client = getSupabaseClient()
): Promise<MediaAsset> => {
  const fileName = request.fileName ?? ("name" in request.file ? request.file.name : "upload.bin");
  const path = buildStoragePath(fileName, request.target);
  const contentType = "type" in request.file ? request.file.type || undefined : undefined;

  const { error } = await client.storage.from(MEDIA_BUCKET_ID).upload(path, request.file, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("Failed to upload media asset", error);
    throw new Error(error.message);
  }

  const { data } = client.storage.from(MEDIA_BUCKET_ID).getPublicUrl(path);
  const normalizedAttribution = normalizeAttribution(request.attribution);
  const type = guessMediaType(contentType);

  return {
    id: nanoid(12),
    type,
    uri: data.publicUrl,
    storagePath: path,
    title: request.title ?? fileName,
    description: request.description ?? null,
    attribution: normalizedAttribution ?? null,
    mimeType: contentType ?? null,
    target: request.target,
    createdAt: new Date().toISOString(),
  } satisfies MediaAsset;
};

export const createLinkAttachment = (
  url: string,
  target: MediaAttachmentTarget,
  attribution?: MediaAttribution | string,
  title = "Reference link",
  description?: string
): MediaAsset => ({
  id: nanoid(12),
  type: "link",
  uri: url,
  storagePath: null,
  title,
  description: description ?? null,
  attribution: normalizeAttribution(attribution) ?? null,
  mimeType: null,
  target,
  createdAt: new Date().toISOString(),
});

export const createTextAttachment = (
  content: string,
  target: MediaAttachmentTarget,
  title = "Field note",
  attribution?: MediaAttribution | string
): MediaAsset => ({
  id: nanoid(12),
  type: "text",
  uri: content,
  storagePath: null,
  title,
  description: null,
  attribution: normalizeAttribution(attribution) ?? null,
  mimeType: "text/plain",
  target,
  createdAt: new Date().toISOString(),
});

export const createExternalVideoAttachment = (
  url: string,
  target: MediaAttachmentTarget,
  attribution?: MediaAttribution | string
): MediaAsset => {
  const validation = validateExternalVideoUrl(url);
  if (!validation.isValid || !validation.embedUrl) {
    throw new Error("Only YouTube or Vimeo URLs are accepted for embeds.");
  }

  return {
    id: nanoid(12),
    type: "external_video",
    uri: validation.embedUrl,
    storagePath: null,
    title: "Embedded video",
    description: `Embedded from ${validation.provider}`,
    attribution: normalizeAttribution(attribution) ?? null,
    mimeType: null,
    target,
    createdAt: new Date().toISOString(),
  } satisfies MediaAsset;
};

export const groupMediaByType = (assets: MediaAsset[]) =>
  assets.reduce(
    (acc, asset) => {
      acc[asset.type] = [...(acc[asset.type] ?? []), asset];
      return acc;
    },
    {} as Record<MediaAssetType, MediaAsset[]>
  );
