"use client";

import { AuthTabs } from "@/components/auth/AuthTabs";
import { readQuizLastAuthEmail } from "@/lib/auth/quiz-auth-cue";

/** Sign-in / sign-up tabs with last-email hint from session (client-only). */
export function EmbeddedAuthPanel({ authNextPath }: { authNextPath: string }) {
  return (
    <AuthTabs
      variant="embedded"
      authNextPath={authNextPath}
      defaultEmailHint={readQuizLastAuthEmail()}
    />
  );
}
