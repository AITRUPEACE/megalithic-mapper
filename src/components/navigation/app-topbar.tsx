"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  onGlobalSearch?: (query: string) => void;
}

export const AppTopbar = ({ onGlobalSearch }: AppTopbarProps) => {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/50 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sites, artifacts, texts, contributors..."
            className="pl-9"
            onChange={(event) => onGlobalSearch?.(event.target.value)}
          />
        </div>
        <Link
          href="/research"
          className={cn(
            "hidden items-center gap-1 rounded-md border border-primary/30 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary md:inline-flex",
            pathname.startsWith("/research") && "bg-primary/10"
          )}
        >
          Research Hub
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="secondary">
          <Link href="/map#new-site">
            <Plus className="mr-1 h-4 w-4" />
            New Contribution
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/profile">
            <ShieldCheck className="mr-1 h-4 w-4" />
            Request Verification
          </Link>
        </Button>
        <Avatar>
          <AvatarFallback>AZ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
