"use client";

import { useState, useMemo } from "react";
import { 
  Sparkles, 
  Flame, 
  MessageSquare, 
  MapPin,
  Search,
  X
} from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Input } from "@/shared/ui/input";
import { cn, timeAgo } from "@/shared/lib/utils";
import type { MapSiteFeature } from "@/entities/map/model/types";

type ActivityType = "new_site" | "hot_site" | "discussion";

interface ActivityItem {
  id: string;
  type: ActivityType;
  siteId: string;
  siteName: string;
  title: string;
  subtitle: string;
  timestamp: Date;
  coordinates: { lat: number; lng: number };
}

interface ActivityFeedProps {
  sites: MapSiteFeature[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
  onFocusSite: (siteId: string) => void;
  className?: string;
}

const activityConfig: Record<ActivityType, { 
  icon: typeof Sparkles; 
  color: string; 
  bg: string;
}> = {
  new_site: { 
    icon: Sparkles, 
    color: "text-amber-400", 
    bg: "bg-amber-500/20",
  },
  hot_site: { 
    icon: Flame, 
    color: "text-orange-400", 
    bg: "bg-orange-500/20",
  },
  discussion: { 
    icon: MessageSquare, 
    color: "text-sky-400", 
    bg: "bg-sky-500/20",
  },
};

type FilterType = "all" | "new" | "hot" | "discussions";

function generateActivityFromSites(sites: MapSiteFeature[]): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const now = new Date();

  sites.forEach((site, index) => {
    const updatedAt = new Date(site.updatedAt);
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 7) {
      activities.push({
        id: `new-${site.id}`,
        type: "new_site",
        siteId: site.id,
        siteName: site.name,
        title: site.name,
        subtitle: site.tags.cultures[0] || "New discovery",
        timestamp: updatedAt,
        coordinates: site.coordinates,
      });
    }

    if (index % 4 === 0) {
      const count = Math.floor(Math.random() * 20 + 5);
      activities.push({
        id: `hot-${site.id}`,
        type: "hot_site",
        siteId: site.id,
        siteName: site.name,
        title: site.name,
        subtitle: `${count} new comments`,
        timestamp: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        coordinates: site.coordinates,
      });
    }

    if (index % 3 === 0) {
      activities.push({
        id: `disc-${site.id}`,
        type: "discussion",
        siteId: site.id,
        siteName: site.name,
        title: site.name,
        subtitle: site.tags.themes[0] || "New discussion",
        timestamp: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        coordinates: site.coordinates,
      });
    }
  });

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function ActivityFeed({ 
  sites, 
  selectedSiteId, 
  onSelectSite, 
  onFocusSite,
  className 
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activities = useMemo(() => generateActivityFromSites(sites), [sites]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (filter === "new" && activity.type !== "new_site") return false;
      if (filter === "hot" && activity.type !== "hot_site") return false;
      if (filter === "discussions" && activity.type !== "discussion") return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.siteName.toLowerCase().includes(query) ||
          activity.title.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activities, filter, searchQuery]);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "✨ New" },
    { key: "hot", label: "🔥 Hot" },
    { key: "discussions", label: "💬 Disc." },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Activity</h2>
          <span className="text-xs text-muted-foreground">{filteredActivities.length} items</span>
        </div>

        {/* Search */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-7 text-xs"
                autoFocus
              />
            </div>
            <button
              type="button"
              className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded hover:bg-muted"
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full flex items-center h-7 px-2 rounded border border-border/60 bg-muted/30 text-xs text-muted-foreground hover:bg-muted/50"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-3 w-3 mr-1.5" />
            Search...
          </button>
        )}

        {/* Filter chips */}
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-0.5">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No activity found
            </div>
          ) : (
            filteredActivities.slice(0, 15).map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              const isSelected = activity.siteId === selectedSiteId;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer group transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                  )}
                  onClick={() => onSelectSite(activity.siteId)}
                >
                  {/* Icon */}
                  <div className={cn("shrink-0 rounded-md p-1.5", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-medium leading-tight line-clamp-2">
                      {activity.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activity.subtitle} · {timeAgo(activity.timestamp)}
                    </p>
                  </div>

                  {/* Focus button */}
                  <button
                    type="button"
                    className="shrink-0 h-6 w-6 rounded opacity-0 group-hover:opacity-100 hover:bg-muted inline-flex items-center justify-center transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusSite(activity.siteId);
                    }}
                    title="Focus on map"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
