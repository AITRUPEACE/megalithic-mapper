import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Compass, Network, Map, BookOpen, ShieldCheck, MessageSquare } from "lucide-react";
import { AuthCtas } from "@/components/landing/AuthCtas";

const featureCards = [
  {
    title: "Global Site Mapping",
    description:
      "Interactive Leaflet maps with civilization filters, verification badges, and quick access to related discussions.",
    icon: Map,
  },
  {
    title: "Collaborative Research Hub",
    description:
      "Structure hypotheses, link artifacts, and log decisions with peers inside dedicated project workspaces.",
    icon: Network,
  },
  {
    title: "Scholarly Knowledge Exchange",
    description:
      "Threaded forums, annotated text repositories, and multimedia galleries curated by verified contributors.",
    icon: MessageSquare,
  },
];

const trustPillars = [
  {
    title: "Verification Program",
    description: "Admins review credentials so explorers can trust contributions and collaboration invites.",
    icon: ShieldCheck,
  },
  {
    title: "Structured Taxonomies",
    description: "Supabase-backed data models keep sites, artifacts, texts, and links searchable across civilizations.",
    icon: BookOpen,
  },
  {
    title: "Map-first Discovery",
    description: "Leaflet clustering, bounding-box filters, and research overlays reveal regional storylines at a glance.",
    icon: Compass,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Ancient Civilizations Research Network
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Map, analyze, and debate the technologies of the ancient world together.
            </h1>
            <p className="text-lg text-muted-foreground">
              Megalithic Mapper unites archaeologists, historians, content creators, and enthusiasts in one collaborative space
              built with Next.js, Supabase, Leaflet, and shadcn/ui.
            </p>
            <AuthCtas />
          </div>
          <div className="glass-panel relative overflow-hidden border-primary/40 p-8">
            <div className="absolute right-12 top-10 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-10 left-16 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative space-y-4">
              <h2 className="text-xl font-semibold">MVP feature pillars</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Leaflet-powered geospatial explorer with verified contributor overlays</li>
                <li>• Supabase auth, profiles, and storage-ready media workflows</li>
                <li>• Research hub for hypotheses, evidence logs, and relationship graphs</li>
                <li>• Forums, image galleries, and embedded video threads</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Built for rapid iteration by a solo developer collaborating with an AI coding agent.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="glass-panel border-border/40">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className="rounded-full bg-primary/20 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </section>

        <section className="glass-panel border-border/40 p-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Collaboration crafted for research breakthroughs</h2>
              <p className="text-muted-foreground">
                Every project receives dedicated hypothesis threads, evidence logs, and entity linkages so teams can document how
                theories evolve. Verified creators surface best practices while enthusiasts learn alongside them.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="rounded-full bg-secondary/40 px-3 py-1">Supabase auth + storage</span>
                <span className="rounded-full bg-secondary/40 px-3 py-1">Leaflet map overlays</span>
                <span className="rounded-full bg-secondary/40 px-3 py-1">shadcn/ui design system</span>
              </div>
            </div>
            <div className="grid gap-4">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="border-border/40 bg-card/80">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <span className="rounded-full bg-secondary/50 p-2 text-secondary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">{pillar.title}</CardTitle>
                        <CardDescription>{pillar.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
