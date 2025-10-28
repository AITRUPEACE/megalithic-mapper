"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MapFilters } from "@/state/site-store";
import { cn } from "@/lib/utils";

interface SiteFiltersProps {
  filters: MapFilters;
  availableCivilizations: string[];
  availableSiteTypes: string[];
  onUpdate: (update: Partial<MapFilters>) => void;
  onClear: () => void;
}

export const SiteFilters = ({
  filters,
  availableCivilizations,
  availableSiteTypes,
  onUpdate,
  onClear,
}: SiteFiltersProps) => {
  const toggleArrayValue = (current: string[], value: string) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  return (
    <div className="glass-panel space-y-4 border-border/40 p-5">
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
          <p className="text-sm font-semibold text-foreground">Civilizations</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableCivilizations.map((civilization) => {
              const isActive = filters.civilizations.includes(civilization);
              return (
                <Button
                  key={civilization}
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("rounded-full", isActive && "border border-primary/40")}
                  onClick={() => onUpdate({
                    civilizations: toggleArrayValue(filters.civilizations, civilization),
                  })}
                >
                  {civilization}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Site Types</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableSiteTypes.map((type) => {
              const isActive = filters.siteTypes.includes(type);
              return (
                <Button
                  key={type}
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("rounded-full", isActive && "border border-primary/40")}
                  onClick={() => onUpdate({ siteTypes: toggleArrayValue(filters.siteTypes, type) })}
                >
                  {type}
                </Button>
              );
            })}
          </div>
        </div>

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
