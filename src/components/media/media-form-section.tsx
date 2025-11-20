"use client";

import { useMemo, useState } from "react";
import type { MediaAsset, MediaAttachmentTargetType } from "@/types/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  createExternalVideoAttachment,
  createLinkAttachment,
  createTextAttachment,
  validateExternalVideoUrl,
} from "@/lib/media";
import { cn } from "@/lib/utils";

interface MediaFormSectionProps {
  targetId: string;
  targetType: MediaAttachmentTargetType;
  assets: MediaAsset[];
  onChange: (assets: MediaAsset[]) => void;
  className?: string;
}

export const MediaFormSection = ({ targetId, targetType, assets, onChange, className }: MediaFormSectionProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [note, setNote] = useState("");
  const [attribution, setAttribution] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const target = useMemo(() => ({ entityId: targetId, entityType: targetType }), [targetId, targetType]);

  const addLink = () => {
    if (!linkUrl.trim()) return;
    const validation = validateExternalVideoUrl(linkUrl.trim());
    const nextAsset = validation.isValid
      ? createExternalVideoAttachment(linkUrl.trim(), target, attribution || undefined)
      : createLinkAttachment(linkUrl.trim(), target, attribution || undefined, "Reference link");
    onChange([...assets, nextAsset]);
    setLinkUrl("");
    setAttribution("");
    setMessage(validation.isValid ? "Embedded video link added." : "Reference link recorded.");
  };

  const addNote = () => {
    if (!note.trim()) return;
    const nextAsset = createTextAttachment(note.trim(), target, "Field note", attribution || undefined);
    onChange([...assets, nextAsset]);
    setNote("");
    setAttribution("");
    setMessage("Inline note captured.");
  };

  const removeAsset = (id: string) => {
    onChange(assets.filter((asset) => asset.id !== id));
  };

  return (
    <div className={cn("space-y-3 rounded-lg border border-border/50 bg-background/50 p-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Media & attachments</p>
          <p className="text-xs text-muted-foreground">Upload later or link references now.</p>
        </div>
        <Badge variant="outline">{assets.length} added</Badge>
      </div>

      {message && <p className="text-xs text-primary">{message}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs uppercase tracking-wide text-muted-foreground">
          Link or video URL
          <Input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="https://youtu.be/... or external link"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addLink}>
            Attach link or embed
          </Button>
        </label>
        <label className="space-y-1 text-xs uppercase tracking-wide text-muted-foreground">
          Attribution
          <Input
            value={attribution}
            onChange={(event) => setAttribution(event.target.value)}
            placeholder="Photographer, researcher, or source"
          />
          <Button type="button" size="sm" variant="ghost" onClick={addNote}>
            Add inline note
          </Button>
        </label>
      </div>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Field note text
        <Textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Context, caption, or provenance notes"
        />
      </label>

      {assets.length > 0 && (
        <ul className="space-y-2 text-sm">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between rounded-md border border-border/40 bg-background/80 px-3 py-2"
            >
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">{asset.title ?? asset.type}</p>
                <p className="text-xs text-muted-foreground truncate">{asset.uri}</p>
              </div>
              <Button size="sm" variant="ghost" type="button" onClick={() => removeAsset(asset.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
