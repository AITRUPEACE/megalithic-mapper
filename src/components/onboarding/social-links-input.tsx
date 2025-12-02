"use client";

import { useState } from "react";
import { 
  Youtube, 
  Twitter, 
  Instagram, 
  Globe, 
  Link2, 
  Plus, 
  X,
  GripVertical 
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export type SocialPlatform = "youtube" | "twitter" | "instagram" | "website" | "other";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string;
}

const platformConfig: Record<SocialPlatform, { 
  icon: typeof Youtube; 
  label: string; 
  placeholder: string;
  color: string;
}> = {
  youtube: { 
    icon: Youtube, 
    label: "YouTube", 
    placeholder: "youtube.com/@yourchannel",
    color: "text-red-500"
  },
  twitter: { 
    icon: Twitter, 
    label: "Twitter / X", 
    placeholder: "twitter.com/yourhandle",
    color: "text-sky-500"
  },
  instagram: { 
    icon: Instagram, 
    label: "Instagram", 
    placeholder: "instagram.com/yourhandle",
    color: "text-pink-500"
  },
  website: { 
    icon: Globe, 
    label: "Website", 
    placeholder: "yoursite.com",
    color: "text-primary"
  },
  other: { 
    icon: Link2, 
    label: "Other Link", 
    placeholder: "any URL",
    color: "text-muted-foreground"
  },
};

interface SocialLinksInputProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  maxLinks?: number;
}

export function SocialLinksInput({ 
  links, 
  onChange, 
  maxLinks = 6 
}: SocialLinksInputProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addLink = (platform: SocialPlatform) => {
    const newLink: SocialLink = {
      id: crypto.randomUUID(),
      platform,
      url: "",
      label: platform === "other" ? "" : undefined,
    };
    onChange([...links, newLink]);
    setShowAddMenu(false);
  };

  const updateLink = (id: string, updates: Partial<SocialLink>) => {
    onChange(links.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const removeLink = (id: string) => {
    onChange(links.filter(link => link.id !== id));
  };

  const availablePlatforms = (Object.keys(platformConfig) as SocialPlatform[]).filter(
    platform => platform === "other" || !links.some(l => l.platform === platform)
  );

  return (
    <div className="space-y-3">
      {/* Existing links */}
      {links.map((link) => {
        const config = platformConfig[link.platform];
        const Icon = config.icon;
        
        return (
          <div 
            key={link.id} 
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 p-2 transition-colors hover:border-border"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50">
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            
            <div className="flex-1 space-y-1">
              {link.platform === "other" && (
                <Input
                  value={link.label || ""}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  placeholder="Link name"
                  className="h-7 border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                />
              )}
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder={config.placeholder}
                className={cn(
                  "h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0",
                  link.platform !== "other" && "font-medium"
                )}
              />
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeLink(link.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {/* Add link button/menu */}
      {links.length < maxLinks && (
        <div className="relative">
          {showAddMenu ? (
            <div className="rounded-lg border border-border/60 bg-card p-2">
              <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                Add a link
              </p>
              <div className="grid grid-cols-2 gap-1">
                {availablePlatforms.map((platform) => {
                  const config = platformConfig[platform];
                  const Icon = config.icon;
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => addLink(platform)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <Icon className={cn("h-4 w-4", config.color)} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setShowAddMenu(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setShowAddMenu(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add link
            </Button>
          )}
        </div>
      )}

      {links.length === 0 && !showAddMenu && (
        <p className="text-center text-sm text-muted-foreground">
          Add your social links so people can find your work
        </p>
      )}
    </div>
  );
}

