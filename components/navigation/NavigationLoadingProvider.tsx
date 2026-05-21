"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { PageLoadingScreen } from "@/components/ui/PageLoadingScreen";

type NavigationLoadingContextValue = {
  startNavigation: (href: string, message?: string) => void;
};

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

export function useNavigationLoading(): NavigationLoadingContextValue {
  const ctx = useContext(NavigationLoadingContext);
  if (!ctx) {
    throw new Error("useNavigationLoading must be used within NavigationLoadingProvider");
  }
  return ctx;
}

type NavState = {
  active: boolean;
  message: string;
  targetPath: string | null;
};

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [nav, setNav] = useState<NavState>({
    active: false,
    message: "Loading…",
    targetPath: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNavTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startNavigation = useCallback(
    (href: string, message?: string) => {
      clearNavTimeout();
      const targetPath = href.split("?")[0] || href;
      setNav({
        active: true,
        message: message ?? "Loading…",
        targetPath,
      });
      timeoutRef.current = setTimeout(() => {
        setNav({ active: false, message: "Loading…", targetPath: null });
      }, 20000);
    },
    [clearNavTimeout],
  );

  useEffect(() => {
    if (!nav.active || !nav.targetPath) return;

    const reached =
      pathname === nav.targetPath || pathname.startsWith(`${nav.targetPath}/`);

    if (!reached) return;

    const hideId = window.setTimeout(() => {
      setNav({ active: false, message: "Loading…", targetPath: null });
      clearNavTimeout();
    }, 120);

    return () => window.clearTimeout(hideId);
  }, [pathname, nav.active, nav.targetPath, clearNavTimeout]);

  useEffect(() => () => clearNavTimeout(), [clearNavTimeout]);

  return (
    <NavigationLoadingContext.Provider value={{ startNavigation }}>
      {children}
      {nav.active ? <PageLoadingScreen message={nav.message} /> : null}
    </NavigationLoadingContext.Provider>
  );
}
