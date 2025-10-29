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
  const isMapRoute = pathname.startsWith("/map");

  return (
    <aside
      className={cn(
        "group flex h-full flex-col border-r border-border/60 bg-background/60 backdrop-blur transition-[width] duration-300 ease-out",
        isMapRoute ? "w-16 hover:w-64 xl:w-20 xl:hover:w-64" : "w-64"
      )}
    >
      <div className={cn("flex items-center px-4 py-5", isMapRoute && "justify-center group-hover:justify-start xl:justify-center xl:group-hover:justify-start")}>
        <Link href="/map" className="flex items-center gap-2 text-lg font-semibold">
          <span
            className={cn(
              "rounded-full bg-primary/20 px-2 py-1 text-xs uppercase tracking-wide text-primary transition-opacity duration-200",
              isMapRoute ? "opacity-0 group-hover:opacity-100 xl:group-hover:opacity-100 xl:opacity-0" : "opacity-100"
            )}
          >
            Megalithic Mapper
          </span>
          <Map className={cn("h-5 w-5 text-primary", isMapRoute ? "inline-block" : "hidden")} />
        </Link>
      </div>
      <nav className={cn("flex-1 space-y-1 px-2", isMapRoute && "px-1 group-hover:px-3 xl:px-1 xl:group-hover:px-3")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-secondary/70",
                isMapRoute && "h-11 px-0 group-hover:px-2 xl:px-0 xl:group-hover:px-2"
              )}
            >
              <Link href={item.href} className="flex w-full items-center gap-2">
                <Icon className="mx-auto h-4 w-4 group-hover:mx-0 xl:group-hover:mx-0" />
                <span
                  className={cn(
                    "text-sm font-medium transition-[opacity,transform] duration-200",
                    isMapRoute ? "invisible translate-x-[-8px] group-hover:visible group-hover:translate-x-0 xl:group-hover:visible xl:group-hover:translate-x-0 xl:invisible" : "visible"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </Button>
          );
        })}
      </nav>
      <div
        className={cn(
          "p-4 text-xs text-muted-foreground transition-opacity duration-200",
          isMapRoute ? "opacity-0 group-hover:opacity-100 xl:group-hover:opacity-100 xl:opacity-0" : "opacity-100"
        )}
      >
        <p>
          Connected explorers: <span className="font-semibold text-foreground">128 online</span>
        </p>
        <p className="mt-1">
          Research projects active today: <span className="font-semibold text-foreground">6</span>
        </p>
      </div>
    </aside>
  );
};
