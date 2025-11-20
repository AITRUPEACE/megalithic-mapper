"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  description?: string;
  className?: string;
}

export const TagSelector = ({
  label,
  value,
  onChange,
  placeholder = "Add tag and press Enter",
  suggestions = [],
  description,
  className,
}: TagSelectorProps) => {
  const [pending, setPending] = useState("");

  const addTag = (tag: string) => {
    const formatted = tag.trim();
    if (!formatted || value.includes(formatted)) return;
    onChange([...value, formatted]);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((existing) => existing !== tag));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTag(pending);
    setPending("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={pending}
          onChange={(event) => setPending(event.target.value)}
          placeholder={placeholder}
        />
        <Button type="submit" size="sm" variant="secondary">
          Add
        </Button>
      </form>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-2">
              #{tag}
              <button type="button" className="text-xs" onClick={() => removeTag(tag)}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {suggestions.map((tag) => (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={value.includes(tag) ? "secondary" : "ghost"}
              onClick={() => addTag(tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
