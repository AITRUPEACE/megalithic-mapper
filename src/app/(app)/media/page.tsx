import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleMediaAssets } from "@/data/sample-media";
import { timeAgo } from "@/lib/utils";

export default function MediaPage() {
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sampleMediaAssets.map((media) => (
          <Card key={media.id} className="glass-panel border-border/40 overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={media.thumbnail}
                alt={media.title}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
              <Badge className="absolute left-3 top-3 bg-black/60 text-xs uppercase tracking-wide">
                {media.type}
              </Badge>
            </div>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">{media.title}</CardTitle>
              <CardDescription>
                {media.civilization} • Contributed by {media.contributor}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2 text-xs">
                {media.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Uploaded {timeAgo(media.createdAt)}</p>
              <div className="flex gap-3 text-xs">
                <Link href={media.url} className="text-primary hover:underline">
                  View source →
                </Link>
                <Link href={`/research?media=${media.id}`} className="text-primary hover:underline">
                  Link to hypothesis →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
