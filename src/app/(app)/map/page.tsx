import { Suspense } from "react";
import { SiteExplorer } from "./_components/site-explorer";

export default function MapPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading map…</div>}>
      <SiteExplorer />
    </Suspense>
  );
}
