"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import type { MapSiteFeature, MapZoneFeature, SiteCategory, VerificationStatus, MapLayer, CommunityTier } from "@/entities/map/model/types";
import { useMapStore } from "@/features/map-explorer/model/map-store";
import type { MapStoreState } from "@/features/map-explorer/model/map-store";
import { CoordinatePicker } from "./coordinate-picker";
import { TagSelector } from "./tag-selector";
import { cn } from "@/shared/lib/utils";

import { Trash2, Plus, Link as LinkIcon, Image as ImageIcon, Video, FileText } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

interface SiteEditorProps {
	zones: MapZoneFeature[];
	site?: MapSiteFeature | null;
	onClose?: () => void;
	className?: string;
	pendingCoordinates?: { lat: number; lng: number } | null;
}

type MediaResource = {
	id: string;
	type: "image" | "video" | "document" | "link";
	url: string;
	title: string;
};

type DraftFormState = {
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
	mediaResources: MediaResource[];
	color: string;
};

const DEFAULT_SITE: DraftFormState = {
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
	mediaResources: [],
	color: "#3b82f6", // Default blue
};

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);

export const SiteEditor = ({ zones, site, onClose, className, pendingCoordinates }: SiteEditorProps) => {
	const { optimisticUpsertSite, sites, selectSite } = useMapStore(
		useShallow((state: MapStoreState) => ({
			optimisticUpsertSite: state.optimisticUpsertSite,
			sites: state.sites,
			selectSite: state.selectSite,
		}))
	);
	const [form, setForm] = useState<DraftFormState>(DEFAULT_SITE);
	const [cultureTags, setCultureTags] = useState<string[]>([]);
	const [eraTags, setEraTags] = useState<string[]>([]);
	const [themeTags, setThemeTags] = useState<string[]>([]);
	const [message, setMessage] = useState<string | null>(null);

	// New media input state
	const [newMediaUrl, setNewMediaUrl] = useState("");
	const [newMediaTitle, setNewMediaTitle] = useState("");
	const [newMediaType, setNewMediaType] = useState<MediaResource["type"]>("link");

	useEffect(() => {
		if (pendingCoordinates) {
			setForm((prev) => ({ ...prev, coordinates: pendingCoordinates }));
		}
	}, [pendingCoordinates]);

	const cultureSuggestions = useMemo(() => Array.from(new Set(sites.flatMap((site) => site.tags.cultures))).slice(0, 6), [sites]);
	const eraSuggestions = useMemo(() => Array.from(new Set(sites.flatMap((site) => site.tags.eras))).slice(0, 6), [sites]);
	const themeSuggestions = useMemo(() => Array.from(new Set(sites.flatMap((site) => site.tags.themes))).slice(0, 6), [sites]);

	const handleChange = <K extends keyof DraftFormState>(field: K, value: DraftFormState[K]) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	useEffect(() => {
		if (!site) {
			setForm(DEFAULT_SITE);
			setCultureTags([]);
			setEraTags([]);
			setThemeTags([]);
			return;
		}

		setForm({
			name: site.name,
			summary: site.summary,
			siteType: site.siteType,
			category: site.category,
			layer: site.layer,
			trustTier: site.trustTier ?? "bronze",
			verificationStatus: site.verificationStatus,
			updatedBy: site.updatedBy,
			zoneIds: site.zoneMemberships.map((zone) => zone.id),
			coordinates: site.coordinates,
			mediaResources: (site.evidenceLinks || []).map((link, i) => ({
				id: `link-${i}`,
				type: "link",
				url: link,
				title: `Link ${i + 1}`,
			})),
			color: "#3b82f6", // Default, not persisted in site feature
		});
		setCultureTags(site.tags.cultures);
		setEraTags(site.tags.eras);
		setThemeTags(site.tags.themes);
	}, [site]);

	const toggleZone = (zoneId: string) => {
		setForm((prev) => ({
			...prev,
			zoneIds: prev.zoneIds.includes(zoneId) ? prev.zoneIds.filter((id) => id !== zoneId) : [...prev.zoneIds, zoneId],
		}));
	};

	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.name.trim() || !form.siteType.trim() || !form.summary.trim()) {
			setMessage("Provide a name, summary, and site type before saving.");
			return;
		}

		if (form.coordinates.lat === 0 && form.coordinates.lng === 0) {
			setMessage("Please set coordinates by clicking on the map.");
			return;
		}

		setIsSaving(true);
		setMessage(null);

		const links = form.mediaResources
			.filter((m) => m.type === "link" || m.type === "video")
			.map((m) => m.url);

		try {
			// Save to Supabase via API
			const response = await fetch("/api/sites", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name.trim(),
					slug: slugify(form.name),
					summary: form.summary.trim(),
					siteType: form.siteType.trim(),
					category: form.category,
					coordinates: form.coordinates,
					tags: {
						cultures: cultureTags,
						eras: eraTags,
						themes: themeTags,
					},
					zoneIds: form.zoneIds,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save site");
			}

			// Also update local state for immediate UI feedback
			optimisticUpsertSite({
				id: result.site?.id || site?.id,
				name: form.name.trim(),
				slug: slugify(form.name),
				summary: form.summary.trim(),
				siteType: form.siteType.trim(),
				category: form.category,
				coordinates: form.coordinates,
				verificationStatus: "under_review",
				layer: "community",
				trustTier: "bronze",
				tags: {
					cultures: cultureTags,
					eras: eraTags,
					themes: themeTags,
				},
				zoneIds: form.zoneIds,
				updatedBy: form.updatedBy.trim() || "field.builder",
				mediaCount: form.mediaResources.filter((m) => m.type !== "link").length,
				relatedResearchIds: [],
				evidenceLinks: links,
			});

			setForm(DEFAULT_SITE);
			setCultureTags([]);
			setEraTags([]);
			setThemeTags([]);
			setNewMediaUrl("");
			setNewMediaTitle("");
			setMessage("✓ Site submitted for community review!");
			
			// Close after brief delay to show success message
			setTimeout(() => {
				onClose?.();
			}, 1500);
		} catch (error) {
			console.error("Error saving site:", error);
			setMessage(`Error: ${error instanceof Error ? error.message : "Failed to save site"}`);
		} finally {
			setIsSaving(false);
		}
	};

	const addMedia = () => {
		if (!newMediaUrl.trim()) return;
		const resource: MediaResource = {
			id: `media-${Date.now()}`,
			type: newMediaType,
			url: newMediaUrl,
			title: newMediaTitle || newMediaType,
		};
		setForm((prev) => ({
			...prev,
			mediaResources: [...prev.mediaResources, resource],
		}));
		setNewMediaUrl("");
		setNewMediaTitle("");
	};

	const removeMedia = (id: string) => {
		setForm((prev) => ({
			...prev,
			mediaResources: prev.mediaResources.filter((m) => m.id !== id),
		}));
	};

	return (
		<form onSubmit={handleSubmit} className={cn("space-y-4 rounded-xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto", className)}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-semibold text-foreground">{site ? `Edit site: ${site.name}` : "Create or edit site"}</p>
				<div className="flex gap-2">
					{onClose && (
						<Button type="button" variant="ghost" size="sm" onClick={onClose}>
							Cancel
						</Button>
					)}
					{site && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								setForm(DEFAULT_SITE);
								setCultureTags([]);
								setEraTags([]);
								setThemeTags([]);
								selectSite(null);
							}}
						>
							New site
						</Button>
					)}
					<Button type="submit" size="sm" disabled={isSaving}>
						{isSaving ? "Saving..." : site ? "Save changes" : "Submit Site"}
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
				<label className="text-xs uppercase tracking-wide text-muted-foreground">
					Color (Visual only)
					<div className="flex gap-2 mt-1">
						<input
							type="color"
							value={form.color}
							onChange={(e) => handleChange("color", e.target.value)}
							className="h-9 w-12 rounded border border-border/40 bg-background p-1"
						/>
						<Input value={form.color} onChange={(e) => handleChange("color", e.target.value)} placeholder="#000000" className="flex-1" />
					</div>
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
				helperText={pendingCoordinates ? "Coordinates picked from map." : "Click map to set coordinates or enter manually."}
				value={form.coordinates}
				onChange={(value) => handleChange("coordinates", value)}
			/>

			<div className="space-y-3 border rounded-lg p-3 bg-background/50">
				<p className="text-sm font-semibold">Media & Links</p>

				<div className="grid gap-2 sm:grid-cols-[100px_1fr_1fr_auto]">
					<select
						className="rounded-md border border-border/40 bg-background p-2 text-sm"
						value={newMediaType}
						onChange={(e) => setNewMediaType(e.target.value as MediaResource["type"])}
					>
						<option value="link">Link</option>
						<option value="image">Image</option>
						<option value="video">Video</option>
						<option value="document">Doc</option>
					</select>
					<Input placeholder="URL (http://...)" value={newMediaUrl} onChange={(e) => setNewMediaUrl(e.target.value)} className="h-9" />
					<Input placeholder="Title (optional)" value={newMediaTitle} onChange={(e) => setNewMediaTitle(e.target.value)} className="h-9" />
					<Button type="button" size="sm" variant="secondary" onClick={addMedia}>
						<Plus className="h-4 w-4" />
					</Button>
				</div>

				{form.mediaResources.length > 0 && (
					<div className="space-y-2 max-h-[120px] overflow-y-auto">
						{form.mediaResources.map((resource) => (
							<div key={resource.id} className="flex items-center gap-2 rounded-md border border-border/40 bg-background/50 p-2 text-sm">
								{resource.type === "image" && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
								{resource.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
								{resource.type === "document" && <FileText className="h-4 w-4 text-muted-foreground" />}
								{resource.type === "link" && <LinkIcon className="h-4 w-4 text-muted-foreground" />}
								<span className="flex-1 truncate">{resource.title || resource.url}</span>
								<Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedia(resource.id)}>
									<Trash2 className="h-3 w-3 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>

			<TagSelector
				label="Cultures"
				value={cultureTags}
				onChange={setCultureTags}
				suggestions={cultureSuggestions}
				description="Add cultural affiliations linked to this entry."
			/>
			<TagSelector label="Eras" value={eraTags} onChange={setEraTags} suggestions={eraSuggestions} />
			<TagSelector label="Themes" value={themeTags} onChange={setThemeTags} suggestions={themeSuggestions} />

			{zones.length > 0 && (
				<div className="space-y-2 text-sm">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Zone memberships</p>
					<div className="flex flex-wrap gap-3">
						{zones.map((zone) => {
							const checked = form.zoneIds.includes(zone.id);
							return (
								<label key={zone.id} className="flex items-center gap-2 text-xs">
									<input type="checkbox" checked={checked} onChange={() => toggleZone(zone.id)} />
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
