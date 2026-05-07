import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CHECKOUT_BASE_URL: z
    .union([z.string().url(), z.literal("")])
    .optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function getServerEnv(): ServerEnv {
  return serverSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CHECKOUT_BASE_URL: process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL,
  });
}

export function getCheckoutBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL;
  if (v && v.length > 0) return v;
  return "https://example.com/checkout";
}

export function getPublicSiteUrl(): string {
  const v = process.env.NEXT_PUBLIC_SITE_URL;
  if (v && v.length > 0) return v;
  return "http://localhost:3000";
}
