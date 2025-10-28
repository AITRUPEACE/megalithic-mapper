"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, MessageSquare, Images, BookOpen, Network, Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/media", label: "Media", icon: Images },
  { href: "/texts", label: "Text Library", icon: BookOpen },
  { href: "/research", label: "Research Hub", icon: Network },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-background/60 backdrop-blur">
      <div className="px-6 py-5">
        <Link href="/map" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs uppercase tracking-wide text-primary">
            Megalithic Mapper
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", isActive && "bg-secondary/70")}
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-muted-foreground">
        <p>Connected explorers: <span className="font-semibold text-foreground">128 online</span></p>
        <p className="mt-1">Research projects active today: <span className="font-semibold text-foreground">6</span></p>
      </div>
    </aside>
  );
};
