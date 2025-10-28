import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleSites } from "@/data/sample-sites";
import { sampleResearchProjects } from "@/data/sample-research";
import { sampleThreads } from "@/data/sample-discussions";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

export default function DiscoverPage() {
  const featuredSites = sampleSites.slice(0, 3);
  const activeProjects = sampleResearchProjects.slice(0, 2);
  const hotThreads = sampleThreads.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Discover</h1>
          <p className="text-sm text-muted-foreground">
            Surface trending sites, collaborative hypotheses, and conversations curated from the research network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/map">View on map</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/research">Join a project</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        {featuredSites.map((site) => (
          <Card key={site.id} className="glass-panel border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={site.verificationStatus === "verified" ? "success" : "warning"}>
                  {site.verificationStatus === "verified" ? "Verified" : "Under review"}
                </Badge>
                <span className="text-xs text-muted-foreground">Updated {timeAgo(site.lastUpdated)}</span>
              </div>
              <CardTitle className="text-xl font-semibold">{site.name}</CardTitle>
              <CardDescription>
                {site.civilization} • {site.era}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{site.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {site.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary/40 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
              <Link href={`/map?focus=${site.id}`} className="text-xs text-primary hover:underline">
                Zoom to location →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="glass-panel border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Active research projects</CardTitle>
              <Badge variant="secondary">Research Hub</Badge>
            </div>
            <CardDescription>
              Collaborative spaces where verified contributors and trusted explorers document their findings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project) => (
              <div key={project.id} className="rounded-lg border border-border/40 bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Lead investigator: {project.leadInvestigator} • {project.collaboratorCount} collaborators
                    </p>
                  </div>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{project.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {project.objectives.slice(0, 2).map((objective) => (
                    <span key={objective} className="rounded-full bg-secondary/40 px-3 py-1">
                      {objective}
                    </span>
                  ))}
                </div>
                <Link href={`/research/${project.id}`} className="mt-4 inline-block text-xs text-primary hover:underline">
                  View project workspace →
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/40">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Lively discussions</CardTitle>
            <CardDescription>Verified contributors and explorers iterating on new hypotheses in real time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {hotThreads.map((thread) => (
              <div key={thread.id} className="rounded-lg border border-border/40 bg-card/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span>{thread.category}</span>
                  <span>{timeAgo(thread.lastUpdated)}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{thread.title}</h3>
                <p className="mt-1 line-clamp-3">{thread.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {thread.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                      #{tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">{thread.replies} replies</span>
                </div>
                <Link href={`/forum?thread=${thread.id}`} className="mt-3 inline-block text-xs text-primary hover:underline">
                  Join conversation →
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
