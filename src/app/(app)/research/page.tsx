import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleResearchProjects } from "@/data/sample-research";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function ResearchPage() {
  const active = sampleResearchProjects.filter((project) => project.status === "active");
  const draft = sampleResearchProjects.filter((project) => project.status === "draft");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Research Hub</h1>
          <p className="text-sm text-muted-foreground">
            Coordinate theory building with structured hypotheses, evidence logs, and entity relationships.
          </p>
        </div>
        <Badge variant="secondary">Beta workflow</Badge>
      </div>

      <Tabs defaultValue="active" className="glass-panel border-border/40 p-6">
        <TabsList>
          <TabsTrigger value="active">Active projects</TabsTrigger>
          <TabsTrigger value="draft">Draft concepts</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6 border-0 p-0">
          <div className="space-y-6">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="draft" className="mt-6 border-0 p-0">
          <div className="space-y-6">
            {draft.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectCard({ project }: { project: (typeof sampleResearchProjects)[number] }) {
  return (
    <Card className="border border-border/40 bg-card/70">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-semibold">{project.title}</CardTitle>
            <CardDescription>
              Lead: {project.leadInvestigator} • {project.collaboratorCount} collaborators
            </CardDescription>
          </div>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{project.summary}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Objectives</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {project.objectives.map((objective) => (
                <li key={objective}>• {objective}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Linked entities</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {project.linkedEntities.map((entity) => (
                <li key={`${project.id}-${entity.id}`}>{entity.type.toUpperCase()} • {entity.name}</li>
              ))}
            </ul>
          </div>
        </div>
        <Separator className="border-border/40" />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hypotheses</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {project.hypotheses.map((hypothesis) => (
                <li key={hypothesis.id} className="rounded-lg border border-border/40 bg-secondary/30 p-3">
                  <p className="font-semibold text-foreground">{hypothesis.title}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Status: {hypothesis.status} • Confidence: {hypothesis.confidence}
                  </p>
                  <p className="mt-1 text-xs">Evidence items: {hypothesis.evidenceCount}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent activity</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {project.activity.map((item) => (
                <li key={item.id} className="rounded-lg border border-border/40 bg-secondary/30 p-3">
                  <p className="font-semibold text-foreground">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
        <Link href={`/map?project=${project.id}`} className="text-primary hover:underline">
          View linked sites →
        </Link>
        <Link href={`/forum?project=${project.id}`} className="text-primary hover:underline">
          Open project discussion →
        </Link>
      </CardFooter>
    </Card>
  );
}
