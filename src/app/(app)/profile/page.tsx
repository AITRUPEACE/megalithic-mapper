import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your contributor credentials, expertise tags, and verification status.
          </p>
        </div>
        <Button variant="secondary">Edit profile</Button>
      </div>

      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Amina Z. (Archaeo-acoustics)</CardTitle>
          <CardDescription>Verified contributor • Joined April 2024</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Expertise tags</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-secondary/40 px-3 py-1">acoustics</span>
              <span className="rounded-full bg-secondary/40 px-3 py-1">Old Kingdom Egypt</span>
              <span className="rounded-full bg-secondary/40 px-3 py-1">LiDAR analysis</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent contributions</p>
            <ul className="space-y-1">
              <li>• Uploaded 3D resonance scans for the King&apos;s Chamber</li>
              <li>• Linked Bremner-Rhind Papyrus translation to Hypothesis H1</li>
              <li>• Opened peer review thread on sarcophagus quartz inclusions</li>
            </ul>
          </div>
          <Separator className="border-border/40" />
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Verification</p>
            <Badge variant="success">Verified contributor</Badge>
            <p>Next review window opens December 2024. Provide new credentials or publications to maintain status.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
