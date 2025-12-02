"use client";

import { 
  Youtube, 
  Twitter, 
  Instagram, 
  Globe, 
  Link2,
  MapPin,
  BadgeCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { SocialLink, SocialPlatform } from "./social-links-input";

const platformIcons: Record<SocialPlatform, typeof Youtube> = {
  youtube: Youtube,
  twitter: Twitter,
  instagram: Instagram,
  website: Globe,
  other: Link2,
};

const platformColors: Record<SocialPlatform, string> = {
  youtube: "hover:text-red-500",
  twitter: "hover:text-sky-500",
  instagram: "hover:text-pink-500",
  website: "hover:text-primary",
  other: "hover:text-foreground",
};

interface ProfilePreviewCardProps {
  displayName: string;
  username: string;
  headline: string;
  avatarUrl?: string;
  location?: string;
  socialLinks: SocialLink[];
  expertiseTags?: string[];
  isVerified?: boolean;
}

export function ProfilePreviewCard({
  displayName,
  username,
  headline,
  avatarUrl,
  location,
  socialLinks,
  expertiseTags = [],
  isVerified = false,
}: ProfilePreviewCardProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasContent = displayName || username || headline;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card/80 to-card">
      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10" />
      
      {/* Avatar - overlapping header */}
      <div className="px-6">
        <Avatar className="-mt-10 h-20 w-20 border-4 border-card">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6 pt-3">
        {/* Name & handle */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">
              {displayName || <span className="text-muted-foreground">Your Name</span>}
            </h3>
            {isVerified && (
              <BadgeCheck className="h-5 w-5 text-primary" />
            )}
          </div>
          <p className="text-muted-foreground">
            @{username || <span className="italic">username</span>}
          </p>
        </div>

        {/* Headline/Bio */}
        <p className={cn(
          "text-sm leading-relaxed",
          headline ? "text-foreground" : "text-muted-foreground italic"
        )}>
          {headline || "Your headline will appear here..."}
        </p>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => {
              const Icon = platformIcons[link.platform];
              const colorClass = platformColors[link.platform];
              
              if (!link.url) return null;
              
              return (
                <a
                  key={link.id}
                  href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors",
                    colorClass
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label || link.platform}
                </a>
              );
            })}
          </div>
        )}

        {/* Expertise tags */}
        {expertiseTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {expertiseTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons (preview only) */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1" disabled>
            Follow
          </Button>
          <Button size="sm" variant="outline" className="flex-1" disabled>
            Message
          </Button>
        </div>

        {/* Empty state hint */}
        {!hasContent && (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Fill in the form to see your profile come to life ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

