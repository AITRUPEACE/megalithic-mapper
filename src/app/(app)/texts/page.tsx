import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleTextSources } from "@/data/sample-texts";

export default function TextLibraryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Text Library</h1>
          <p className="text-sm text-muted-foreground">
            Annotated manuscripts, translations, and field notes powering collaborative hypotheses.
          </p>
        </div>
      </div>

      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Curated sources</CardTitle>
          <CardDescription>Each entry links to research projects and discussions within the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleTextSources.map((text) => (
            <div key={text.id} className="rounded-lg border border-border/40 bg-card/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{text.title}</h2>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {text.civilization} • {text.era} • {text.language}
                  </p>
                </div>
                <Badge variant="secondary">{text.tags[0]}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{text.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {text.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary/40 px-2 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
              {text.downloadUrl && (
                <Link href={text.downloadUrl} className="mt-3 inline-block text-xs text-primary hover:underline">
                  Download reference →
                </Link>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
