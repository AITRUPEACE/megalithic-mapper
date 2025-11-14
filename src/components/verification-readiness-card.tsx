import { ShieldCheck, IdCard, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const requirements = [
  {
    label: "Government-issued ID",
    description: "Needed to match your name during verification reviews.",
    icon: IdCard,
  },
  {
    label: "Academic or field credential",
    description: "Upload a diploma, certification, or published work snippet.",
    icon: FileCheck2,
  },
  {
    label: "Recent contribution proof",
    description: "Links to talks, digs, or community leadership roles.",
    icon: ShieldCheck,
  },
];

export function VerificationReadinessCard() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Verification readiness</CardTitle>
            <CardDescription>
              Prepare these items so you can request contributor verification later.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Optional
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <ul className="space-y-3">
          {requirements.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-start gap-3 rounded-md bg-background/40 p-3">
                <span className="rounded-full bg-primary/15 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="rounded-md border border-dashed border-primary/30 bg-background/30 p-4 text-xs">
          <p className="font-semibold text-primary">Why it matters</p>
          <p>
            Verified contributors gain elevated publishing rights and can sponsor map spotlights. Keep documents handy so the
            review team can respond quickly.
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/profile/verification">Review verification flow</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
