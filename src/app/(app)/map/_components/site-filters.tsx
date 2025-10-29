"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MapFilters } from "@/state/site-store";
import { cn } from "@/lib/utils";
import type { CommunityTier } from "@/lib/types";

interface SiteFiltersProps {
  filters: MapFilters;
  availableCivilizations: string[];
  availableSiteTypes: string[];
  availableCommunityTiers: CommunityTier[];
  onUpdate: (update: Partial<MapFilters>) => void;
  onClear: () => void;
  className?: string;
  variant?: "card" | "flat";
}

export const SiteFilters = ({
  filters,
  availableCivilizations,
  availableSiteTypes,
  availableCommunityTiers,
  onUpdate,
  onClear,
  className,
  variant = "card",
}: SiteFiltersProps) => {
  const toggleArrayValue = <T extends string>(current: T[], value: T) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  const containerClasses =
    variant === "card"
      ? "glass-panel space-y-4 border-border/40 p-5"
      : "flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-border/40 bg-background/15 p-5";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Search</p>
        <Input
          placeholder="Search by site name, tags, civilization..."
          value={filters.search}
          onChange={(event) => onUpdate({ search: event.target.value })}
        />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Map layer</p>
          <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
            {[
              { value: "official" as const, label: "Official" },
              { value: "community" as const, label: "Community" },
              { value: "composite" as const, label: "Combined" },
            ].map((option) => {
              const isActive = filters.layer === option.value;
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "rounded-full sm:shrink-0",
                    isActive && "border border-primary/40"
                  )}
                  onClick={() =>
                    onUpdate({
                      layer: option.value,
                      communityTiers: option.value === "official" ? [] : filters.communityTiers,
                    })
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Civilizations</p>
          <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
            {availableCivilizations.map((civilization) => {
              const isActive = filters.civilizations.includes(civilization);
              return (
                <Button
                  key={civilization}
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "rounded-full sm:shrink-0",
                    isActive && "border border-primary/40"
                  )}
                  onClick={() =>
                    onUpdate({
                      civilizations: toggleArrayValue(filters.civilizations, civilization),
                    })
                  }
                >
                  {civilization}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Site types</p>
          <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
            {availableSiteTypes.map((type) => {
              const isActive = filters.siteTypes.includes(type);
              return (
                <Button
                  key={type}
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "rounded-full sm:shrink-0",
                    isActive && "border border-primary/40"
                  )}
                  onClick={() => onUpdate({ siteTypes: toggleArrayValue(filters.siteTypes, type) })}
                >
                  {type}
                </Button>
              );
            })}
          </div>
        </div>

        {availableCommunityTiers.length > 0 && filters.layer !== "official" && (
          <div>
            <p className="text-sm font-semibold text-foreground">Community tier</p>
            <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pr-2">
              {availableCommunityTiers.map((tier) => {
                const isActive = filters.communityTiers.includes(tier);
                const labelMap: Record<CommunityTier, string> = {
                  bronze: "Bronze",
                  silver: "Silver",
                  gold: "Gold",
                  promoted: "Promoted",
                };
                return (
                  <Button
                    key={tier}
                    size="sm"
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "rounded-full sm:shrink-0",
                      isActive && "border border-primary/40"
                    )}
                    onClick={() =>
                      onUpdate({
                        communityTiers: toggleArrayValue(filters.communityTiers, tier),
                      })
                    }
                  >
                    {labelMap[tier]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant={filters.verification === "verified" ? "secondary" : "ghost"}
            onClick={() =>
              onUpdate({ verification: filters.verification === "verified" ? "all" : "verified" })
            }
          >
            Verified only
          </Button>
          <Button
            size="sm"
            variant={filters.researchOnly ? "secondary" : "ghost"}
            onClick={() => onUpdate({ researchOnly: !filters.researchOnly })}
          >
            Linked to research projects
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            Reset filters
          </Button>
        </div>
      </div>
    </div>
  );
};
