import * as React from "react";

import { cn } from "@/lib/utils";

type PanelProps = React.HTMLAttributes<HTMLDivElement>;

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border border-border/40 bg-background/70 shadow-sm", className)}
      {...props}
    />
  )
);
Panel.displayName = "Panel";

export const PanelHeader = ({ className, ...props }: PanelProps) => (
  <div className={cn("border-b border-border/30 px-4 py-3", className)} {...props} />
);

export const PanelTitle = ({ className, ...props }: PanelProps) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export const PanelDescription = ({ className, ...props }: PanelProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const PanelContent = ({ className, ...props }: PanelProps) => (
  <div className={cn("p-4", className)} {...props} />
);
