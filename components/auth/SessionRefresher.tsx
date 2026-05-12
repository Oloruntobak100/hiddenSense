"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * Keeps Supabase access tokens fresh when users return to a backgrounded tab
 * and primes the singleton browser client on first paint.
 */
export function SessionRefresher() {
  useEffect(() => {
    const sb = createBrowserSupabaseClient();

    const bump = () => {
      if (document.visibilityState === "visible") {
        void sb.auth.getSession();
      }
    };

    bump();
    document.addEventListener("visibilitychange", bump);
    return () => document.removeEventListener("visibilitychange", bump);
  }, []);

  return null;
}
