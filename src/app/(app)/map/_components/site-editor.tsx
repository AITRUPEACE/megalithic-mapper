"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { MapZoneFeature, SiteCategory, VerificationStatus, MapLayer, CommunityTier } from "@/types/map";
import { useMapStore } from "@/state/map-store";
import { CoordinatePicker } from "./coordinate-picker";
import { TagSelector } from "./tag-selector";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/types/media";
import { MediaFormSection } from "@/components/media/media-form-section";

interface SiteEditorProps {
  zones: MapZoneFeature[];
  onClose?: () => void;
  className?: string;
}

type DraftFormState = {
  id?: string;
  name: string;
  summary: string;
  siteType: string;
  category: SiteCategory;
  layer: MapLayer;
  trustTier: CommunityTier;
  verificationStatus: VerificationStatus;
  updatedBy: string;
  zoneIds: string[];
  coordinates: { lat: number; lng: number };
};

const DEFAULT_SITE: DraftFormState = {
  id: undefined,
  name: "",
  summary: "",
  siteType: "",
  category: "site",
  layer: "community",
  trustTier: "bronze",
  verificationStatus: "unverified",
  updatedBy: "field.builder",
  zoneIds: [],
  coordinates: { lat: 0, lng: 0 },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const SiteEditor = ({ zones, onClose, className }: SiteEditorProps) => {
  const { optimisticUpsertSite, sites } = useMapStore((state) => ({
    optimisticUpsertSite: state.optimisticUpsertSite,
    sites: state.sites,
  }));
  const [form, setForm] = useState<DraftFormState>(DEFAULT_SITE);
  const [cultureTags, setCultureTags] = useState<string[]>([]);
  const [eraTags, setEraTags] = useState<string[]>([]);
  const [themeTags, setThemeTags] = useState<string[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const cultureSuggestions = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => site.tags.cultures))).slice(0, 6),
    [sites]
  );
  const eraSuggestions = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => site.tags.eras))).slice(0, 6),
    [sites]
  );
  const themeSuggestions = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => site.tags.themes))).slice(0, 6),
    [sites]
  );

  const handleChange = <K extends keyof DraftFormState>(field: K, value: DraftFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleZone = (zoneId: string) => {
    setForm((prev) => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter((id) => id !== zoneId)
        : [...prev.zoneIds, zoneId],
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.siteType.trim() || !form.summary.trim()) {
      setMessage("Provide a name, summary, and site type before saving.");
      return;
    }

    optimisticUpsertSite({
      id: undefined,
      name: form.name.trim(),
      slug: slugify(form.name),
      summary: form.summary.trim(),
      siteType: form.siteType.trim(),
      category: form.category,
      coordinates: form.coordinates,
      verificationStatus: form.verificationStatus,
      layer: form.layer,
      trustTier: form.trustTier,
      tags: {
        cultures: cultureTags,
        eras: eraTags,
        themes: themeTags,
      },
      zoneIds: form.zoneIds,
      updatedBy: form.updatedBy.trim() || "field.builder",
      mediaAssets,
      mediaCount: mediaAssets.length,
      relatedResearchIds: [],
    });

    setForm(DEFAULT_SITE);
    setCultureTags([]);
    setEraTags([]);
    setThemeTags([]);
    setMediaAssets([]);
    setMessage("Site saved locally. Supabase mutation pending integration.");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4 rounded-xl p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Create or edit site</p>
        <div className="flex gap-2">
          {onClose && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm">
            Save site
          </Button>
        </div>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Site name
          <Input value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Updated by
          <Input value={form.updatedBy} onChange={(event) => handleChange("updatedBy", event.target.value)} />
        </label>
      </div>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Summary
        <Textarea value={form.summary} onChange={(event) => handleChange("summary", event.target.value)} rows={3} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Site type
          <Input value={form.siteType} onChange={(event) => handleChange("siteType", event.target.value)} />
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Category
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={form.category}
            onChange={(event) => handleChange("category", event.target.value as SiteCategory)}
          >
            <option value="site">Site</option>
            <option value="artifact">Artifact</option>
            <option value="text">Text</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Layer
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={form.layer}
            onChange={(event) => handleChange("layer", event.target.value as MapLayer)}
          >
            <option value="official">Official</option>
            <option value="community">Community</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Verification
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={form.verificationStatus}
            onChange={(event) => handleChange("verificationStatus", event.target.value as VerificationStatus)}
          >
            <option value="verified">Verified</option>
            <option value="under_review">Under review</option>
            <option value="unverified">Unverified</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Trust tier
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={form.trustTier}
            onChange={(event) => handleChange("trustTier", event.target.value as CommunityTier)}
          >
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="promoted">Promoted</option>
          </select>
        </label>
      </div>

      <CoordinatePicker
        label="Coordinates"
        helperText="Use decimal degrees for Leaflet markers."
        value={form.coordinates}
        onChange={(value) => handleChange("coordinates", value)}
      />

      <TagSelector
        label="Cultures"
        value={cultureTags}
        onChange={setCultureTags}
        suggestions={cultureSuggestions}
        description="Add cultural affiliations linked to this entry."
      />
      <TagSelector
        label="Eras"
        value={eraTags}
        onChange={setEraTags}
        suggestions={eraSuggestions}
      />
      <TagSelector
        label="Themes"
        value={themeTags}
        onChange={setThemeTags}
        suggestions={themeSuggestions}
      />

      <MediaFormSection
        targetId={form.id ?? "draft-site"}
        targetType="site"
        assets={mediaAssets}
        onChange={setMediaAssets}
      />

      {zones.length > 0 && (
        <div className="space-y-2 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Zone memberships</p>
          <div className="flex flex-wrap gap-3">
            {zones.map((zone) => {
              const checked = form.zoneIds.includes(zone.id);
              return (
                <label key={zone.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleZone(zone.id)}
                  />
                  <span>{zone.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </form>
  );
};
