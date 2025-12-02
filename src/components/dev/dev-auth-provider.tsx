"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { DEV_USERS, type DevUserKey } from "./dev-auth-panel";

const DEV_AUTH_STORAGE_KEY = "megalithic-dev-user";

interface DevAuthContextValue {
  devUser: (typeof DEV_USERS)[DevUserKey] | null;
  devUserKey: DevUserKey | null;
  isDevMode: boolean;
  signInAsDev: (userKey: DevUserKey) => void;
  signOutDev: () => void;
}

const DevAuthContext = createContext<DevAuthContextValue | undefined>(undefined);

export function DevAuthProvider({ children }: { children: ReactNode }) {
  const [devUserKey, setDevUserKey] = useState<DevUserKey | null>(null);
  const [mounted, setMounted] = useState(false);

  const isDevMode = process.env.NODE_ENV === "development";

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (isDevMode && typeof window !== "undefined") {
      const stored = localStorage.getItem(DEV_AUTH_STORAGE_KEY);
      if (stored && stored in DEV_USERS) {
        setDevUserKey(stored as DevUserKey);
      }
    }
  }, [isDevMode]);

  const signInAsDev = (userKey: DevUserKey) => {
    setDevUserKey(userKey);
    if (typeof window !== "undefined") {
      localStorage.setItem(DEV_AUTH_STORAGE_KEY, userKey);
      // Also set a cookie so middleware can read it
      document.cookie = `dev-auth-bypass=true; path=/; max-age=86400`;
      document.cookie = `dev-user-id=${DEV_USERS[userKey].id}; path=/; max-age=86400`;
      document.cookie = `dev-user-key=${userKey}; path=/; max-age=86400`;
    }
  };

  const signOutDev = () => {
    setDevUserKey(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
      document.cookie = "dev-auth-bypass=; path=/; max-age=0";
      document.cookie = "dev-user-id=; path=/; max-age=0";
      document.cookie = "dev-user-key=; path=/; max-age=0";
    }
  };

  const devUser = devUserKey ? DEV_USERS[devUserKey] : null;

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <DevAuthContext.Provider
      value={{
        devUser,
        devUserKey,
        isDevMode,
        signInAsDev,
        signOutDev,
      }}
    >
      {children}
    </DevAuthContext.Provider>
  );
}

export function useDevAuth(): DevAuthContextValue {
  const context = useContext(DevAuthContext);
  // Return a safe default if context isn't available yet (SSR or before provider mounts)
  if (!context) {
    return {
      devUser: null,
      devUserKey: null,
      isDevMode: process.env.NODE_ENV === "development",
      signInAsDev: () => {},
      signOutDev: () => {},
    };
  }
  return context;
}

