"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MapFilters } from "@/state/site-store";
import { cn } from "@/lib/utils";
import type { CommunityTier } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FilterX, Settings2, Search } from "lucide-react";

interface SiteFiltersProps {
  filters: MapFilters;
  availableCivilizations: string[];
  availableSiteTypes: string[];
  availableCommunityTiers: CommunityTier[];
  availableContinents: string[];
  availableZones: string[];
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
  availableContinents,
  availableZones,
  onUpdate,
  onClear,
  className,
  variant = "card",
}: SiteFiltersProps) => {
  const toggleArrayValue = <T extends string>(current: T[], value: T) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  const containerClasses =
    variant === "card"
      ? "glass-panel space-y-3 border-border/40 p-5"
      : "flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/20 p-4";

  const activeBadges = useMemo(() => {
    const badges: string[] = [];

    if (filters.layer !== "composite") {
      badges.push(`Layer: ${filters.layer}`);
    }

    if (filters.continents.length) {
      badges.push(`Continents (${filters.continents.length})`);
    }

    if (filters.zones.length) {
      badges.push(`Zones (${filters.zones.length})`);
    }

    if (filters.civilizations.length) {
      badges.push(`Civilizations (${filters.civilizations.length})`);
    }

    if (filters.siteTypes.length) {
      badges.push(`Site types (${filters.siteTypes.length})`);
    }

    if (filters.communityTiers.length) {
      badges.push(`Community tier (${filters.communityTiers.length})`);
    }

    if (filters.verification === "verified") {
      badges.push("Verified only");
    }

    if (filters.researchOnly) {
      badges.push("Research linked");
    }

    return badges;
  }, [filters]);

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by site name, tags, civilization..."
            value={filters.search}
            onChange={(event) => onUpdate({ search: event.target.value })}
            className="pl-9"
          />
        </div>
        <Accordion type="single" collapsible className="relative flex-shrink-0">
          <AccordionItem value="filters" className="border-none">
            <AccordionTrigger className="flex h-9 items-center gap-2 rounded-md border border-border/40 bg-background/40 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-background/60">
              <Settings2 className="h-3.5 w-3.5" />
              Filters
            </AccordionTrigger>
            <AccordionContent className="absolute right-0 top-full z-10 mt-2 w-[600px] max-w-[calc(100vw-2rem)] space-y-4 rounded-xl border border-border/40 bg-background/95 p-4 shadow-xl backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Map layer</p>
                <div className="mt-2 flex flex-wrap gap-2">
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
                        className={cn("rounded-full", isActive && "border border-primary/40")}
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

              <div className="grid gap-4 md:grid-cols-2">
                <FilterGroup
                  title="Continents"
                  emptyLabel="All continents"
                  values={availableContinents}
                  activeValues={filters.continents}
                  onToggle={(continent) =>
                    onUpdate({ continents: toggleArrayValue(filters.continents, continent) })
                  }
                />
                <FilterGroup
                  title="Archaeological zones"
                  emptyLabel="All zones"
                  values={availableZones}
                  activeValues={filters.zones}
                  onToggle={(zone) => onUpdate({ zones: toggleArrayValue(filters.zones, zone) })}
                />
              </div>

              <Separator className="border-border/40" />

              <div className="grid gap-4 md:grid-cols-2">
                <FilterGroup
                  title="Civilizations"
                  emptyLabel="All civilizations"
                  values={availableCivilizations}
                  activeValues={filters.civilizations}
                  onToggle={(civilization) =>
                    onUpdate({ civilizations: toggleArrayValue(filters.civilizations, civilization) })
                  }
                />
                <FilterGroup
                  title="Site types"
                  emptyLabel="All site types"
                  values={availableSiteTypes}
                  activeValues={filters.siteTypes}
                  onToggle={(type) => onUpdate({ siteTypes: toggleArrayValue(filters.siteTypes, type) })}
                />
              </div>

              {availableCommunityTiers.length > 0 && filters.layer !== "official" && (
                <FilterGroup
                  title="Community tier"
                  emptyLabel="Any tier"
                  values={availableCommunityTiers}
                  activeValues={filters.communityTiers}
                  labelMap={{
                    bronze: "Bronze",
                    silver: "Silver",
                    gold: "Gold",
                    promoted: "Promoted",
                  }}
                  onToggle={(tier) =>
                    onUpdate({
                      communityTiers: toggleArrayValue(filters.communityTiers, tier),
                    })
                  }
                />
              )}

              <Separator className="border-border/40" />

              <div className="flex flex-wrap items-center gap-2">
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {!!activeBadges.length && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
            {activeBadges.map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-primary/10">
                {badge}
              </Badge>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onClear}>
            <FilterX className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

interface FilterGroupProps<T extends string> {
  title: string;
  emptyLabel: string;
  values: T[];
  activeValues: T[];
  onToggle: (value: T) => void;
  labelMap?: Partial<Record<T, string>>;
}

const FilterGroup = <T extends string>({
  title,
  emptyLabel,
  values,
  activeValues,
  onToggle,
  labelMap,
}: FilterGroupProps<T>) => {
  if (!values.length) {
    return (
      <div className="rounded-xl border border-border/30 bg-background/40 p-4 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const isActive = activeValues.includes(value);
          const label = labelMap?.[value] ?? value;
          return (
            <Button
              key={value}
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              className={cn("rounded-full", isActive && "border border-primary/40")}
              onClick={() => onToggle(value)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
