"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { AttachmentDescriptor, DiscussionComment, DiscussionEntityRef, MentionMetadata, MentionTarget } from "@/types/discussion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommentComposerProps {
  threadId: string;
  parentId?: string;
  entityRef: DiscussionEntityRef;
  onSubmit: (payload: {
    body: string;
    attachments: AttachmentDescriptor[];
    mentions: MentionMetadata[];
    entityRef: DiscussionEntityRef;
    parentId?: string;
  }) => Promise<DiscussionComment>;
  initialMentions?: MentionTarget[];
  optimisticAuthors?: Record<string, MentionTarget>;
}

const markdownLite = (value: string) => {
  const escaped = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bolded = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  const italicized = bolded.replace(/_(.*?)_/g, "<em>$1</em>");
  return italicized.replace(/`(.*?)`/g, "<code class=\"rounded bg-muted px-1\">$1</code>").replace(/\n/g, "<br />");
};

export const CommentComposer = ({
  threadId,
  parentId,
  entityRef,
  onSubmit,
  initialMentions = [],
  optimisticAuthors = {},
}: CommentComposerProps) => {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<AttachmentDescriptor[]>([]);
  const [mentions, setMentions] = useState<MentionTarget[]>(initialMentions);
  const [suggestions, setSuggestions] = useState<MentionTarget[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/mentions?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        const payload = await response.json();
        setSuggestions(payload.results ?? []);
      } catch (error) {
        console.error("Failed to load mention suggestions", error);
      }
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const renderedPreview = useMemo(() => markdownLite(value), [value]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const mapped: AttachmentDescriptor[] = Array.from(files).map((file) => ({
      id: nanoid(),
      name: file.name,
      size: file.size,
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
          ? "video"
          : "document",
      previewUrl: URL.createObjectURL(file),
    }));

    setAttachments((previous) => [...previous, ...mapped]);
  };

  const collectMentionMetadata = (): MentionMetadata[] => {
    const metadata: MentionMetadata[] = [];

    mentions.forEach((mention) => {
      const handle = mention.handle ?? mention.displayName.replace(/\s+/g, "").toLowerCase();
      const needle = `@${handle}`;
      let searchIndex = value.indexOf(needle);

      while (searchIndex >= 0) {
        metadata.push({
          mention,
          location: { start: searchIndex, end: searchIndex + needle.length },
          reason: "mention",
        });
        searchIndex = value.indexOf(needle, searchIndex + needle.length);
      }
    });

    if (parentId && optimisticAuthors[parentId]) {
      metadata.push({
        mention: optimisticAuthors[parentId],
        location: { start: 0, end: 0 },
        reason: "reply",
      });
    }

    return metadata;
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;
    const mentionMetadata = collectMentionMetadata();

    try {
      setIsLoading(true);
      await onSubmit({ body: value, attachments, mentions: mentionMetadata, entityRef, parentId });
      setValue("");
      setAttachments([]);
      setMentions(initialMentions);
      setSuggestions([]);
      setQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentionSelection = (target: MentionTarget) => {
    const handle = target.handle ?? target.displayName.replace(/\s+/g, "").toLowerCase();
    const updatedValue = value.replace(/@[\w\.]*$/, `@${handle} `);
    setValue(updatedValue);
    if (!mentions.find((existing) => existing.id === target.id)) {
      setMentions((prev) => [...prev, target]);
    }
    setSuggestions([]);
    setQuery("");
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);

    const match = /@([\w\.]{2,})$/.exec(nextValue.slice(0, event.target.selectionStart));
    setQuery(match ? match[1] : "");
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Join the discussion</p>
        {mentions.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {mentions.map((mention) => (
              <Badge key={mention.id} variant="secondary" className="flex items-center gap-1">
                @{mention.handle ?? mention.displayName}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Share a quick observation, add a data point, or @mention a collaborator"
        className="min-h-[120px] bg-background/60"
      />

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/10 p-2 text-xs">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleMentionSelection(suggestion)}
              className="rounded-md bg-card px-2 py-1 text-left shadow-sm transition hover:scale-[1.01]"
              type="button"
            >
              <div className="font-semibold text-foreground">{suggestion.displayName}</div>
              {suggestion.handle && <div className="text-[11px] text-muted-foreground">@{suggestion.handle}</div>}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Markdown-lite preview</p>
        <div
          className="min-h-[80px] rounded-lg border border-border/50 bg-background/40 p-3 text-sm"
          dangerouslySetInnerHTML={{ __html: renderedPreview }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          className="max-w-sm text-xs"
          aria-label="Attach media"
        />
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-md border border-border/50 bg-background/60 px-2 py-1 text-xs"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  attachment.type === "image" && "bg-blue-400",
                  attachment.type === "video" && "bg-amber-400",
                  attachment.type === "document" && "bg-emerald-400",
                  attachment.type === "link" && "bg-purple-400"
                )}
              />
              <span className="font-medium text-foreground">{attachment.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">
          Parent: {parentId ?? "thread"} • Attachments stored on submission • Mentions send notifications
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} size="sm">
          {isLoading ? "Posting..." : "Post comment"}
        </Button>
      </div>
    </div>
  );
};
