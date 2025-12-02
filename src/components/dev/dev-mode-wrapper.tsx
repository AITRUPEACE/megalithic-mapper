"use client";

import { useRouter } from "next/navigation";
import { DevAuthProvider, useDevAuth } from "./dev-auth-provider";
import { DevAuthPanel, type DevUserKey, DEV_USERS } from "./dev-auth-panel";

function DevAuthPanelInner() {
  const router = useRouter();
  const { devUserKey, signInAsDev, signOutDev } = useDevAuth();

  const handleSignIn = (userKey: DevUserKey) => {
    signInAsDev(userKey);
    
    // Navigate based on user state
    const user = DEV_USERS[userKey];
    if (userKey === "newuser" || !user.username) {
      router.push("/onboarding");
    } else {
      router.push("/map");
    }
    
    // Force a page refresh to update auth state
    router.refresh();
  };

  const handleSignOut = () => {
    signOutDev();
    router.push("/");
    router.refresh();
  };

  return (
    <DevAuthPanel
      currentUser={devUserKey}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
    />
  );
}

export function DevModeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DevAuthProvider>
      {children}
      <DevAuthPanelInner />
    </DevAuthProvider>
  );
}
