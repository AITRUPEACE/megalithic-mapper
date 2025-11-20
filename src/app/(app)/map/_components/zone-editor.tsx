"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CoordinatePicker } from "./coordinate-picker";
import { TagSelector } from "./tag-selector";
import type { BoundingBox, CoordinatePair } from "@/types/map";
import { useMapStore } from "@/state/map-store";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/types/media";
import { MediaFormSection } from "@/components/media/media-form-section";

interface ZoneEditorProps {
  onClose?: () => void;
  className?: string;
}

const DEFAULT_BOUNDS: BoundingBox = { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0 };
const DEFAULT_POINT: CoordinatePair = { lat: 0, lng: 0 };

export const ZoneEditor = ({ onClose, className }: ZoneEditorProps) => {
  const { optimisticUpsertZone } = useMapStore((state) => ({ optimisticUpsertZone: state.optimisticUpsertZone }));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [bounds, setBounds] = useState<BoundingBox>(DEFAULT_BOUNDS);
  const [centroid, setCentroid] = useState<CoordinatePair>(DEFAULT_POINT);
  const [cultureFocus, setCultureFocus] = useState<string[]>([]);
  const [eraFocus, setEraFocus] = useState<string[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Zone name is required.");
      return;
    }

    optimisticUpsertZone({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      description: description.trim(),
      color,
      bounds,
      centroid,
      cultureFocus,
      eraFocus,
    });

    setName("");
    setDescription("");
    setColor("#2563eb");
    setBounds(DEFAULT_BOUNDS);
    setCentroid(DEFAULT_POINT);
    setCultureFocus([]);
    setEraFocus([]);
    setMediaAssets([]);
    setMessage("Zone saved and linked to local markers. Media will sync once storage is wired.");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4 rounded-xl p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Define collaborative zone</p>
        <div className="flex gap-2">
          {onClose && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" variant="secondary">
            Save zone
          </Button>
        </div>
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}

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

      <TagSelector label="Culture focus" value={cultureFocus} onChange={setCultureFocus} />
      <TagSelector label="Era focus" value={eraFocus} onChange={setEraFocus} />

      <MediaFormSection
        targetId={name || "draft-zone"}
        targetType="zone"
        assets={mediaAssets}
        onChange={setMediaAssets}
      />
    </form>
  );
};
