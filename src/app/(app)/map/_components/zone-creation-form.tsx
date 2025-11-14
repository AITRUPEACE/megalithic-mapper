"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MediaAttachmentField } from "@/components/media/media-attachment-field";
import type { MediaAttachmentDraft, MediaAttachmentTarget } from "@/types/media";
import { isFeatureEnabled } from "@/lib/feature-flags";

interface ZoneCreationFormProps {
  className?: string;
}

interface ZoneFormState {
  name: string;
  focus: string;
  boundary: string;
  outcome: string;
}

const DEFAULT_ZONE: ZoneFormState = {
  name: "",
  focus: "",
  boundary: "",
  outcome: "",
};

export const ZoneCreationForm = ({ className }: ZoneCreationFormProps) => {
  const [form, setForm] = useState<ZoneFormState>({ ...DEFAULT_ZONE });
  const [attachments, setAttachments] = useState<MediaAttachmentDraft[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const mediaAttachmentsEnabled = isFeatureEnabled("mediaAttachments");

  const attachmentTarget = useMemo<MediaAttachmentTarget>(() => {
    const slug = form.name
      ? form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "draft-zone"
      : "draft-zone";
    return { entityType: "zone", entityId: slug };
  }, [form.name]);

  const handleChange = (field: keyof ZoneFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.focus.trim()) {
      setMessage("Provide a zone name and focus area before saving.");
      return;
    }
    setMessage(
      `Draft zone “${form.name.trim()}” staged with ${attachments.length} media annotations. Moderators will receive the boundary and logistics summary.`
    );
    setForm({ ...DEFAULT_ZONE });
    setAttachments([]);
  };

  return (
    <div className={cn("rounded-xl border border-border/40 bg-background/20 p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Define a research zone</h3>
          <p className="text-xs text-muted-foreground">
            Use zones to cluster provisional pins, share itinerary context, and stage uploads before you travel on site.
          </p>
        </div>
        <Badge variant="outline">Survey planning</Badge>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 text-xs">
            <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="zone-name">
              Zone name
            </label>
            <Input
              id="zone-name"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="e.g. Phalasarna littoral transect"
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="zone-focus">
              Primary focus
            </label>
            <Input
              id="zone-focus"
              value={form.focus}
              onChange={(event) => handleChange("focus", event.target.value)}
              placeholder="e.g. Submerged sonar verification"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="zone-boundary">
            Boundary description
          </label>
          <Textarea
            id="zone-boundary"
            value={form.boundary}
            onChange={(event) => handleChange("boundary", event.target.value)}
            placeholder="Outline polygon coordinates, site references, or travel corridor you plan to inspect."
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="zone-outcome">
            Desired outcome
          </label>
          <Textarea
            id="zone-outcome"
            value={form.outcome}
            onChange={(event) => handleChange("outcome", event.target.value)}
            placeholder="What questions are you testing and what evidence would validate the zone?"
          />
        </div>

        {mediaAttachmentsEnabled ? (
          <MediaAttachmentField
            value={attachments}
            onChange={setAttachments}
            target={attachmentTarget}
            title="Zone evidence & playlists"
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border/40 bg-background/40 p-4 text-xs text-muted-foreground">
            Zone uploads reuse the shared media workflow. Keep drafting locations; the attachments section will appear once both branches merge.
          </div>
        )}

        <Button type="submit" size="sm">
          Stage zone for moderators
        </Button>
      </form>

      {message && <p className="mt-4 text-xs text-primary">{message}</p>}
    </div>
  );
};
