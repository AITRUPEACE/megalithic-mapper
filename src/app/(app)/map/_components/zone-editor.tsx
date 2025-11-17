"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CoordinatePicker } from "./coordinate-picker";
import { TagSelector } from "./tag-selector";
import type { BoundingBox, CoordinatePair, ZoneVerificationState } from "@/types/map";
import { useMapStore } from "@/state/map-store";
import { cn } from "@/lib/utils";

interface ZoneEditorProps {
  onClose?: () => void;
  className?: string;
}

const DEFAULT_BOUNDS: BoundingBox = { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0 };
const DEFAULT_POINT: CoordinatePair = { lat: 0, lng: 0 };
const DEFAULT_VERIFICATION: ZoneVerificationState = "draft";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const ZoneEditor = ({ onClose, className }: ZoneEditorProps) => {
  const { optimisticUpsertZone, zones } = useMapStore((state) => ({
    optimisticUpsertZone: state.optimisticUpsertZone,
    zones: state.zones,
  }));
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [bounds, setBounds] = useState<BoundingBox>(DEFAULT_BOUNDS);
  const [centroid, setCentroid] = useState<CoordinatePair>(DEFAULT_POINT);
  const [cultureFocus, setCultureFocus] = useState<string[]>([]);
  const [eraFocus, setEraFocus] = useState<string[]>([]);
  const [verificationState, setVerificationState] = useState<ZoneVerificationState>(DEFAULT_VERIFICATION);
  const [updatedBy, setUpdatedBy] = useState("zone.curator");
  const [message, setMessage] = useState<string | null>(null);

  const zoneOptions = useMemo(() => zones.map((zone) => ({ id: zone.id, name: zone.name })), [zones]);

  useEffect(() => {
    if (!selectedZoneId) {
      setName("");
      setDescription("");
      setColor("#2563eb");
      setBounds(DEFAULT_BOUNDS);
      setCentroid(DEFAULT_POINT);
      setCultureFocus([]);
      setEraFocus([]);
      setVerificationState(DEFAULT_VERIFICATION);
      setUpdatedBy("zone.curator");
      return;
    }

    const zone = zones.find((entry) => entry.id === selectedZoneId);
    if (!zone) return;

    setName(zone.name);
    setDescription(zone.description);
    setColor(zone.color);
    setBounds(zone.bounds);
    setCentroid(zone.centroid);
    setCultureFocus(zone.cultureFocus);
    setEraFocus(zone.eraFocus);
    setVerificationState(zone.verificationState);
    setUpdatedBy(zone.slug);
  }, [selectedZoneId, zones]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Zone name is required.");
      return;
    }

    optimisticUpsertZone({
      id: selectedZoneId || undefined,
      name: name.trim(),
      slug: slugify(name),
      description: description.trim(),
      color,
      bounds,
      centroid,
      cultureFocus,
      eraFocus,
      verificationState,
      updatedBy,
    });

    setSelectedZoneId("");
    setMessage(selectedZoneId ? "Zone updated and linked to local markers." : "Zone saved and linked to local markers.");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4 rounded-xl p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          {selectedZoneId ? "Edit collaborative zone" : "Define collaborative zone"}
        </p>
        <div className="flex gap-2">
          {onClose && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          {selectedZoneId && (
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedZoneId("")}>
              New zone
            </Button>
          )}
          <Button type="submit" size="sm" variant="secondary">
            {selectedZoneId ? "Save changes" : "Save zone"}
          </Button>
        </div>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}

      {zoneOptions.length > 0 && (
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Load existing zone
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={selectedZoneId}
            onChange={(event) => setSelectedZoneId(event.target.value)}
          >
            <option value="">New zone</option>
            {zoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Zone name
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
      </label>

      <label className="text-xs uppercase tracking-wide text-muted-foreground">
        Highlight color
        <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-24 p-1" />
      </label>

      <CoordinatePicker
        variant="bounds"
        label="Bounding box"
        helperText="Controls Leaflet rectangle overlay."
        value={bounds}
        onChange={setBounds}
      />

      <CoordinatePicker
        label="Centroid"
        helperText="Used for zone summary markers."
        value={centroid}
        onChange={setCentroid}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TagSelector
          label="Culture focus"
          value={cultureFocus}
          onChange={setCultureFocus}
          suggestions={Array.from(new Set(zones.flatMap((zone) => zone.cultureFocus)))}
        />
        <TagSelector
          label="Era focus"
          value={eraFocus}
          onChange={setEraFocus}
          suggestions={Array.from(new Set(zones.flatMap((zone) => zone.eraFocus)))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Verification state
          <select
            className="mt-1 w-full rounded-md border border-border/40 bg-background p-2 text-sm"
            value={verificationState}
            onChange={(event) => setVerificationState(event.target.value as ZoneVerificationState)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Updated by
          <Input value={updatedBy} onChange={(event) => setUpdatedBy(event.target.value)} />
        </label>
      </div>
    </form>
  );
};
