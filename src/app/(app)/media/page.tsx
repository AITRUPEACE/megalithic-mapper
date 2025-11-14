import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleMediaAssets } from "@/data/sample-media";
import { MediaCarousel } from "@/components/media/media-carousel";
import { MediaGallery } from "@/components/media/media-gallery";

export default function MediaPage() {
  const featured = sampleMediaAssets.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            High-resolution imagery, slow-motion experiments, and curated video discussions supporting active research threads.
          </p>
        </div>
        <Button asChild>
          <Link href="/media/new">Upload media</Link>
        </Button>
      </div>

      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Featured uploads</CardTitle>
          <CardDescription>Newest curator-approved media across expeditions and survey zones.</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaCarousel assets={featured} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All assets</h2>
          <Badge variant="outline">{sampleMediaAssets.length} items</Badge>
        </div>
        <MediaGallery assets={sampleMediaAssets} />
      </section>
    </div>
  );
}
