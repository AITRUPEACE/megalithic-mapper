import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleThreads } from "@/data/sample-discussions";
import { timeAgo } from "@/lib/utils";

export default function ForumPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Forum</h1>
          <p className="text-sm text-muted-foreground">
            Structured threads tied to sites, artifacts, and research hypotheses. Verified contributors help moderate quality.
          </p>
        </div>
        <Button asChild>
          <Link href="/(app)/forum/new">Start a new thread</Link>
        </Button>
      </div>

      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Active threads</CardTitle>
          <CardDescription>Recent conversations from the community research workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleThreads.map((thread) => (
            <div key={thread.id} className="rounded-lg border border-border/40 bg-card/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                <span>{thread.category}</span>
                <span>{timeAgo(thread.lastUpdated)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{thread.title}</h2>
                {thread.isVerifiedOnly && <Badge variant="secondary">Verified-only</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{thread.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {thread.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                    #{tag}
                  </span>
                ))}
                <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">{thread.replies} replies</span>
              </div>
              <Link
                href={`/(app)/forum/${thread.id}`}
                className="mt-3 inline-block text-xs text-primary hover:underline"
              >
                Open thread →
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
