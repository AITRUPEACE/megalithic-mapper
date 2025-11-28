"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import type { ActivityNotification } from "@/shared/types/content";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { getBrowserSupabaseClient } from "@/lib/supabase/clients";

interface NotificationBellProps {
  notifications: ActivityNotification[];
  onUnreadChange?: (count: number) => void;
}

export const NotificationBell = ({ notifications, onUnreadChange }: NotificationBellProps) => {
  const [unread, setUnread] = useState(() => notifications.filter((item) => item.unread).length);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel("notification-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => setUnread((count) => count + 1)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    onUnreadChange?.(unread);
  }, [onUnreadChange, unread]);

  return (
    <Button variant="ghost" size="icon" className="relative rounded-full border border-border/40" aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <Badge className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full px-1 text-[11px]" variant="warning">
          {unread}
        </Badge>
      )}
    </Button>
  );
};
