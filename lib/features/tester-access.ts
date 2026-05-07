import "server-only";

export function isTesterUiEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" || process.env.ENABLE_QUICK_LOGIN === "true"
  );
}

export function isOfflineDemoEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" || process.env.ENABLE_OFFLINE_DEMO === "true"
  );
}
