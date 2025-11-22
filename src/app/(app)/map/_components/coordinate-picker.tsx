"use client";

import type { BoundingBox, CoordinatePair } from "@/entities/map/model/types";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

interface BaseProps {
  label?: string;
  helperText?: string;
  className?: string;
}

type PointPickerProps = BaseProps & {
  variant?: "point";
  value: CoordinatePair;
  onChange: (value: CoordinatePair) => void;
};

type BoundsPickerProps = BaseProps & {
  variant: "bounds";
  value: BoundingBox;
  onChange: (value: BoundingBox) => void;
};

export type CoordinatePickerProps = PointPickerProps | BoundsPickerProps;

export const CoordinatePicker = (props: CoordinatePickerProps) => {
  if (props.variant === "bounds") {
    const { value, onChange, label, helperText, className } = props;
    const update = (field: keyof BoundingBox, next: number) => onChange({ ...value, [field]: next });
    return (
      <div className={cn("space-y-2", className)}>
        {label && <p className="text-sm font-semibold text-foreground">{label}</p>}
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Min latitude
            <Input
              type="number"
              step="0.001"
              value={value.minLat}
              onChange={(event) => update("minLat", Number(event.target.value))}
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Min longitude
            <Input
              type="number"
              step="0.001"
              value={value.minLng}
              onChange={(event) => update("minLng", Number(event.target.value))}
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Max latitude
            <Input
              type="number"
              step="0.001"
              value={value.maxLat}
              onChange={(event) => update("maxLat", Number(event.target.value))}
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Max longitude
            <Input
              type="number"
              step="0.001"
              value={value.maxLng}
              onChange={(event) => update("maxLng", Number(event.target.value))}
            />
          </label>
        </div>
      </div>
    );
  }

  const { value, onChange, label, helperText, className } = props;
  const updatePoint = (field: keyof CoordinatePair, next: number) => onChange({ ...value, [field]: next });

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-semibold text-foreground">{label}</p>}
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Latitude
          <Input
            type="number"
            step="0.0001"
            value={value.lat}
            onChange={(event) => updatePoint("lat", Number(event.target.value))}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Longitude
          <Input
            type="number"
            step="0.0001"
            value={value.lng}
            onChange={(event) => updatePoint("lng", Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  );
};
