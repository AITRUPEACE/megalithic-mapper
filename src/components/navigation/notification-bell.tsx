"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { ActivityNotification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  notifications: ActivityNotification[];
  onUnreadChange?: (count: number) => void;
}

export const NotificationBell = ({ notifications, onUnreadChange }: NotificationBellProps) => {
  const [unread, setUnread] = useState(() => notifications.filter((item) => item.unread).length);

  const supabaseConfig = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return supabaseUrl && supabaseKey ? { supabaseUrl, supabaseKey } : null;
  }, []);

  useEffect(() => {
    if (!supabaseConfig) return;
    const supabase = createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseKey);

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
  }, [supabaseConfig]);

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
