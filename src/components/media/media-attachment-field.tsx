"use client";

import { useMemo, useState } from "react";
import { Paperclip, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MediaAttachmentDraft, MediaAttachmentTarget } from "@/types/media";
import { canAttachMedia, normalizeMediaDraft } from "@/lib/media";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: MediaAttachmentDraft["kind"][] = ["image", "video", "audio", "document", "link", "text"];

interface MediaAttachmentFieldProps {
  value: MediaAttachmentDraft[];
  onChange: (drafts: MediaAttachmentDraft[]) => void;
  target: MediaAttachmentTarget;
  className?: string;
  title?: string;
}

export const MediaAttachmentField = ({ value, onChange, target, className, title }: MediaAttachmentFieldProps) => {
  const [kind, setKind] = useState<MediaAttachmentDraft["kind"]>("image");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftText, setDraftText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetDraft = () => {
    setKind("image");
    setDraftTitle("");
    setDraftUrl("");
    setDraftText("");
    setError(null);
  };

  const handleAdd = () => {
    const nextDraft: MediaAttachmentDraft = {
      id: "",
      kind,
      title: draftTitle,
      url: kind === "text" ? undefined : draftUrl,
      text: kind === "text" ? draftText : undefined,
    };

    if (!canAttachMedia(nextDraft)) {
      setError(
        kind === "text"
          ? "Share at least a short paragraph (40+ characters)."
          : "Provide a valid URL from Supabase, YouTube, Vimeo, or https sources."
      );
      return;
    }

    const normalized = normalizeMediaDraft(nextDraft, target);
    onChange([...value, normalized]);
    resetDraft();
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((draft) => draft.id !== id));
  };

  const heading = title ?? "Media attachments";

  const summary = useMemo(() => {
    const totals = value.reduce(
      (acc, draft) => {
        acc[draft.kind] = (acc[draft.kind] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(totals)
      .map(([key, count]) => `${count} ${key}`)
      .join(", ");
  }, [value]);

  return (
    <div className={cn("rounded-lg border border-border/40 bg-background/30 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{heading}</p>
          <p className="text-xs text-muted-foreground">
            Upload evidence, embed external playlists, or add notes for reviewers.
          </p>
        </div>
        {summary && <Badge variant="secondary">{summary}</Badge>}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr]">
        <div className="space-y-1 text-xs">
          <label className="font-semibold uppercase tracking-wide text-muted-foreground">Attachment type</label>
          <select
            className="w-full rounded-md border border-border/60 bg-background/80 p-2 text-sm"
            value={kind}
            onChange={(event) => setKind(event.target.value as MediaAttachmentDraft["kind"])}
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <div className="space-y-1 text-xs">
            <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="media-title">
              Title / caption
            </label>
            <Input
              id="media-title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Describe the asset"
            />
          </div>
          {kind === "text" ? (
            <div className="space-y-1 text-xs">
              <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="media-text">
                Field note or transcription
              </label>
              <Textarea
                id="media-text"
                value={draftText}
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="Write a short paragraph linking to lab notebooks, translation notes, or on-site observations."
              />
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <label className="font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="media-url">
                Media URL
              </label>
              <Input
                id="media-url"
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
            Attach media
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((draft) => (
            <div key={draft.id} className="flex items-center justify-between rounded-md bg-background/60 p-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{draft.title}</p>
                <p className="text-xs text-muted-foreground">
                  {draft.kind === "text" ? `${draft.text?.slice(0, 80)}...` : draft.url}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" /> {draft.kind}
                </Badge>
                <button
                  type="button"
                  className="rounded-full border border-border/40 p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemove(draft.id)}
                  aria-label="Remove attachment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
