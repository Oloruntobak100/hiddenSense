import { getCheckoutBaseUrl } from "@/lib/env";

export function buildCheckoutUrl(params: {
  moodKey: string;
  sessionId: string;
  profileId: string;
  productSlug?: string;
}): string {
  const base = getCheckoutBaseUrl();
  const url = new URL(base);
  url.searchParams.set("utm_source", "hiddensense");
  url.searchParams.set("utm_medium", "web_mvp");
  url.searchParams.set("mood", params.moodKey);
  url.searchParams.set("session_id", params.sessionId);
  url.searchParams.set("profile_id", params.profileId);
  if (params.productSlug) {
    url.searchParams.set("product", params.productSlug);
  }
  return url.toString();
}
