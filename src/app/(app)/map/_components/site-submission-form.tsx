"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CommunityTier, MapSite, SiteCategory } from "@/lib/types";
import { useSiteStore } from "@/state/site-store";
import { MediaAttachmentField } from "@/components/media/media-attachment-field";
import type { MediaAttachmentDraft, MediaAttachmentTarget } from "@/types/media";
import { isFeatureEnabled } from "@/lib/feature-flags";

const CATEGORY_OPTIONS = ["site", "artifact", "text"] as const satisfies ReadonlyArray<SiteCategory>;

const submissionSchema = z.object({
  name: z.string().min(3, "Provide a descriptive name."),
  civilization: z.string().min(2, "Add a civilization or culture."),
  era: z.string().min(2, "Add an era or timeframe."),
  contributor: z.string().min(2, "Enter the contributor handle."),
  category: z.enum(CATEGORY_OPTIONS),
  siteType: z.string().min(2, "Describe the site or record type."),
  latitude: z.coerce
    .number({ invalid_type_error: "Latitude must be a number." })
    .min(-90, "Latitude must be ≥ -90.")
    .max(90, "Latitude must be ≤ 90."),
  longitude: z.coerce
    .number({ invalid_type_error: "Longitude must be a number." })
    .min(-180, "Longitude must be ≥ -180.")
    .max(180, "Longitude must be ≤ 180."),
  summary: z
    .string()
    .min(60, "Share at least 60 characters so reviewers understand the evidence."),
  tags: z
    .string()
    .min(2, "Include at least one tag."),
  relatedResearchIds: z.string().optional(),
  evidenceUrl: z.string().url("Provide a valid URL.").optional(),
});

type SubmissionValues = z.infer<typeof submissionSchema>;

type SubmissionFormState = {
  name: string;
  civilization: string;
  era: string;
  contributor: string;
  category: SiteCategory;
  siteType: string;
  latitude: string;
  longitude: string;
  summary: string;
  tags: string;
  relatedResearchIds: string;
  evidenceUrl: string;
};

interface SubmissionFormProps {
  onSubmitted?: (site: MapSite) => void;
  onCancel?: () => void;
  className?: string;
}

type SubmissionErrors = Partial<Record<keyof SubmissionFormState, string>>;

interface SubmissionAnalysis {
  score: number;
  tier: CommunityTier;
  verificationStatus: MapSite["verificationStatus"];
  suggestions: string[];
  warnings: string[];
}

const DEFAULT_FORM: SubmissionFormState = {
  name: "",
  civilization: "",
  era: "",
  contributor: "",
  category: "site",
  siteType: "",
  latitude: "",
  longitude: "",
  summary: "",
  tags: "",
  relatedResearchIds: "",
  evidenceUrl: "",
};

const CATEGORY_LABEL: Record<SiteCategory, string> = {
  site: "Site",
  artifact: "Artifact",
  text: "Text source",
};

const haversineDistanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const c =
    sinLat * sinLat +
    Math.cos(lat1) *
      Math.cos(lat2) *
      sinLon *
      sinLon;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
};

const analyseSubmission = (values: SubmissionValues, sites: MapSite[]): SubmissionAnalysis => {
  let score = 0.45;
  const suggestions: string[] = [];
  const warnings: string[] = [];

  if (values.summary.trim().length > 140) {
    score += 0.2;
  } else {
    suggestions.push("Expand the summary so reviewers can understand the discovery context.");
  }

  const tags = values.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  if (tags.length >= 3) {
    score += 0.15;
  } else {
    suggestions.push("Add at least three descriptive tags (e.g., material, method, theme).");
  }

  if (values.evidenceUrl) {
    score += 0.1;
  } else {
    suggestions.push("Link to scans, papers, or field notes to speed up verification.");
  }

  const related = values.relatedResearchIds
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (related && related.length > 0) {
    score += 0.05;
  } else {
    suggestions.push("Reference an existing research project or hypothesis if available.");
  }

  const duplicate = sites.find(
    (site) => site.name.toLowerCase() === values.name.trim().toLowerCase()
  );
  if (duplicate) {
    score -= 0.2;
    warnings.push(`Matches existing entry “${duplicate.name}”. Clarify how this submission differs.`);
  }

  const nearbyOfficial = sites.filter((site) => site.layer === "official");
  const proximityHit = nearbyOfficial.find((site) => {
    const distance = haversineDistanceKm(
      { lat: site.latitude, lng: site.longitude },
      { lat: values.latitude, lng: values.longitude }
    );
    return distance < 25;
  });
  if (proximityHit) {
    score -= 0.1;
    warnings.push(
      `Location is within 25km of official entry “${proximityHit.name}”. Include evidence explaining the distinction.`
    );
  }

  score = Math.max(0.1, Math.min(0.95, score));

  let tier: CommunityTier = "bronze";
  if (score >= 0.8) {
    tier = "gold";
  } else if (score >= 0.65) {
    tier = "silver";
  }

  const verificationStatus: MapSite["verificationStatus"] = score >= 0.75 ? "under_review" : "unverified";

  return {
    score,
    tier,
    verificationStatus,
    suggestions,
    warnings,
  };
};

const toTagArray = (value: string): string[] =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const toResearchArray = (value?: string): string[] =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const SiteSubmissionForm = ({ onSubmitted, onCancel, className }: SubmissionFormProps) => {
  const { addSite, sites } = useSiteStore();
  const [form, setForm] = useState<SubmissionFormState>(() => ({ ...DEFAULT_FORM }));
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [analysis, setAnalysis] = useState<SubmissionAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<MediaAttachmentDraft[]>([]);
  const mediaAttachmentsEnabled = isFeatureEnabled("mediaAttachments");

  const isSubmitting = false;

  const suggestions = useMemo(() => analysis?.suggestions ?? [], [analysis]);
  const warnings = useMemo(() => analysis?.warnings ?? [], [analysis]);
  const attachmentTarget = useMemo<MediaAttachmentTarget>(() => {
    const slug = form.name
      ? form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "draft-entry"
      : "draft-entry";
    return {
      entityType: form.category === "site" ? "site" : (form.category as MediaAttachmentTarget["entityType"]),
      entityId: slug,
    };
  }, [form.category, form.name]);

  const handleChange = (field: keyof SubmissionFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "category" ? (value as SiteCategory) : value,
    }));
  };

  const resetForm = () => {
    setForm(() => ({ ...DEFAULT_FORM }));
    setErrors({});
    setAttachments([]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const parsed = submissionSchema.safeParse({
      ...form,
      latitude: form.latitude,
      longitude: form.longitude,
      tags: form.tags,
      relatedResearchIds: form.relatedResearchIds.trim() ? form.relatedResearchIds : undefined,
      evidenceUrl: form.evidenceUrl.trim() ? form.evidenceUrl : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: SubmissionErrors = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof SubmissionValues;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const result = analyseSubmission(parsed.data, sites);
    setAnalysis(result);

    const created = addSite({
      name: parsed.data.name.trim(),
      civilization: parsed.data.civilization.trim(),
      era: parsed.data.era.trim(),
      category: parsed.data.category,
      siteType: parsed.data.siteType.trim(),
      summary: parsed.data.summary.trim(),
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      tags: toTagArray(parsed.data.tags),
      relatedResearchIds: toResearchArray(parsed.data.relatedResearchIds),
      mediaCount: mediaAttachmentsEnabled ? attachments.length : 0,
      verificationStatus: result.verificationStatus,
      layer: "community",
      trustTier: result.tier,
      evidenceLinks: parsed.data.evidenceUrl ? [parsed.data.evidenceUrl] : undefined,
      updatedBy: parsed.data.contributor.trim(),
    });

    setMessage(`Submission recorded with provisional ID ${created.id}. Assigned tier: ${result.tier}.`);
    if (onSubmitted) {
      onSubmitted(created);
    }
    resetForm();
  };

  return (
    <div className={cn("rounded-xl border border-border/40 bg-background/20 p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Contribute a new map entry</h3>
          <p className="text-xs text-muted-foreground">
            Community submissions run through basic heuristics to suggest a starting trust tier before moderator review.
          </p>
        </div>
        <Badge variant="outline">Community intake</Badge>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="name">
              Entry name
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="e.g. Sphinx Resonance Survey"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="contributor">
              Contributor handle
            </label>
            <Input
              id="contributor"
              value={form.contributor}
              onChange={(event) => handleChange("contributor", event.target.value)}
              placeholder="e.g. citizen.larisa"
            />
            {errors.contributor && <p className="text-xs text-destructive">{errors.contributor}</p>}
          </div>
        </div>

        {mediaAttachmentsEnabled ? (
          <MediaAttachmentField value={attachments} onChange={setAttachments} target={attachmentTarget} />
        ) : (
          <div className="rounded-lg border border-dashed border-border/40 bg-background/40 p-4 text-xs text-muted-foreground">
            Media attachments are managed in a separate workflow on this branch. Merge with master will swap in the shared field once available.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="civilization">
              Civilization
            </label>
            <Input
              id="civilization"
              value={form.civilization}
              onChange={(event) => handleChange("civilization", event.target.value)}
              placeholder="e.g. Inca"
            />
            {errors.civilization && <p className="text-xs text-destructive">{errors.civilization}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="era">
              Era
            </label>
            <Input
              id="era"
              value={form.era}
              onChange={(event) => handleChange("era", event.target.value)}
              placeholder="e.g. Late Horizon"
            />
            {errors.era && <p className="text-xs text-destructive">{errors.era}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="category">
              Entry type
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => handleChange("category", event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background/70 px-3 text-sm"
            >
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="siteType">
              Site or record type
            </label>
            <Input
              id="siteType"
              value={form.siteType}
              onChange={(event) => handleChange("siteType", event.target.value)}
              placeholder="e.g. acoustic monolith"
            />
            {errors.siteType && <p className="text-xs text-destructive">{errors.siteType}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="tags">
              Tags (comma separated)
            </label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(event) => handleChange("tags", event.target.value)}
              placeholder="e.g. acoustics, ritual, granite"
            />
            {errors.tags && <p className="text-xs text-destructive">{errors.tags}</p>}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="latitude">
              Latitude
            </label>
            <Input
              id="latitude"
              value={form.latitude}
              onChange={(event) => handleChange("latitude", event.target.value)}
              placeholder="e.g. -13.5195"
            />
            {errors.latitude && <p className="text-xs text-destructive">{errors.latitude}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="longitude">
              Longitude
            </label>
            <Input
              id="longitude"
              value={form.longitude}
              onChange={(event) => handleChange("longitude", event.target.value)}
              placeholder="e.g. -71.9678"
            />
            {errors.longitude && <p className="text-xs text-destructive">{errors.longitude}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="summary">
            Summary
          </label>
          <Textarea
            id="summary"
            value={form.summary}
            onChange={(event) => handleChange("summary", event.target.value)}
            placeholder="Describe what was recorded, how the data was captured, and why it matters."
          />
          {errors.summary && <p className="text-xs text-destructive">{errors.summary}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="relatedResearchIds">
              Linked research IDs (comma separated)
            </label>
            <Input
              id="relatedResearchIds"
              value={form.relatedResearchIds ?? ""}
              onChange={(event) => handleChange("relatedResearchIds", event.target.value)}
              placeholder="e.g. resonant-chambers"
            />
            {errors.relatedResearchIds && <p className="text-xs text-destructive">{errors.relatedResearchIds}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="evidenceUrl">
              Evidence URL (optional)
            </label>
            <Input
              id="evidenceUrl"
              value={form.evidenceUrl ?? ""}
              onChange={(event) => handleChange("evidenceUrl", event.target.value)}
              placeholder="https://..."
            />
            {errors.evidenceUrl && <p className="text-xs text-destructive">{errors.evidenceUrl}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            Submit for review
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {analysis && (
            <Badge variant="secondary">
              Confidence score {Math.round(analysis.score * 100)}%
            </Badge>
          )}
        </div>
      </form>

      {message && <p className="mt-4 text-sm text-foreground">{message}</p>}

      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-400/60 bg-amber-500/10 p-3 text-xs text-amber-200">
          <p className="font-semibold text-amber-100">Moderator alerts</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
          <p className="font-semibold">AI heuristic suggestions</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
