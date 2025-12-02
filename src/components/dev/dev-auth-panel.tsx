"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Shield, 
  GraduationCap, 
  Video, 
  Users,
  ChevronDown,
  LogOut
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

// Mock users for development
export const DEV_USERS = {
  admin: {
    id: "dev-admin-001",
    email: "admin@megalithic.dev",
    username: "admin",
    full_name: "Dev Admin",
    headline: "Platform Administrator",
    role: "admin",
    is_verified: true,
    expertise_tags: ["Administration", "All Access"],
    avatar_url: null,
  },
  researcher: {
    id: "dev-researcher-001",
    email: "researcher@megalithic.dev",
    username: "dr_jones",
    full_name: "Dr. Indiana Jones",
    headline: "Professor of Archaeology",
    role: "researcher",
    is_verified: true,
    expertise_tags: ["Archaeology", "Ancient Egypt", "Lost Artifacts"],
    avatar_url: null,
  },
  creator: {
    id: "dev-creator-001",
    email: "creator@megalithic.dev",
    username: "ancient_explorer",
    full_name: "Graham Hancock",
    headline: "Author & Journalist exploring ancient mysteries",
    role: "expert",
    is_verified: true,
    expertise_tags: ["Lost Civilizations", "Younger Dryas", "Alternative History"],
    avatar_url: null,
  },
  contributor: {
    id: "dev-contributor-001",
    email: "contributor@megalithic.dev",
    username: "site_mapper",
    full_name: "Alex Rivera",
    headline: "Amateur archaeologist & site documentarian",
    role: "contributor",
    is_verified: false,
    expertise_tags: ["Photography", "Site Documentation"],
    avatar_url: null,
  },
  newuser: {
    id: "dev-newuser-001",
    email: "newuser@megalithic.dev",
    username: "",
    full_name: "",
    headline: "",
    role: "user",
    is_verified: false,
    expertise_tags: [],
    avatar_url: null,
    onboarding_completed: false,
  },
} as const;

export type DevUserKey = keyof typeof DEV_USERS;

const userConfig: Record<DevUserKey, { label: string; icon: typeof User; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "text-red-500" },
  researcher: { label: "Researcher", icon: GraduationCap, color: "text-blue-500" },
  creator: { label: "Content Creator", icon: Video, color: "text-purple-500" },
  contributor: { label: "Contributor", icon: Users, color: "text-green-500" },
  newuser: { label: "New User", icon: User, color: "text-muted-foreground" },
};

interface DevAuthPanelProps {
  onSignIn: (userKey: DevUserKey) => void;
  currentUser?: DevUserKey | null;
  onSignOut?: () => void;
}

export function DevAuthPanel({ onSignIn, currentUser, onSignOut }: DevAuthPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-amber-500/30 bg-slate-900 p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                🔧 Dev Auth
              </p>
              {currentUser && onSignOut && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => {
                    onSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Sign out
                </Button>
              )}
            </div>
            
            <div className="space-y-1">
              {(Object.keys(DEV_USERS) as DevUserKey[]).map((key) => {
                const config = userConfig[key];
                const user = DEV_USERS[key];
                const Icon = config.icon;
                const isActive = currentUser === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSignIn(key);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      isActive 
                        ? "bg-amber-500/20 text-amber-500" 
                        : "hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {config.label}
                        {isActive && " ✓"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.full_name || "No profile yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className={cn(
            "border-amber-500/30 bg-slate-900 text-amber-500 hover:bg-amber-500/10",
            currentUser && "border-amber-500"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Shield className="mr-2 h-4 w-4" />
          {currentUser ? userConfig[currentUser].label : "Dev Auth"}
          <ChevronDown className={cn("ml-2 h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>
    </div>
  );
}

