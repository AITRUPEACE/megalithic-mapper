import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { sampleNotifications } from "@/shared/mocks/sample-notifications";
import { timeAgo } from "@/shared/lib/utils";

const notificationLabels: Record<(typeof sampleNotifications)[number]["type"], string> = {
  mention: "Mention",
  verification: "Verification",
  research_update: "Research update",
  comment: "Comment",
  system: "System",
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-20 sm:p-6 md:p-8 md:pb-8">
      <div>
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay on top of mentions, verification steps, and project activity in one place.
        </p>
      </div>

      <Card className="glass-panel border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent updates</CardTitle>
          <CardDescription>Unread messages are highlighted to help you prioritize responses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/70 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={notification.unread ? "warning" : "secondary"}>
                    {notificationLabels[notification.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo(notification.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{notification.summary}</p>
              </div>
              {notification.link && (
                <Link href={notification.link.href} className="text-xs text-primary hover:underline">
                  {notification.link.label} →
                </Link>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
