"use client";

import Link from "next/link";
import { AdminPanel, AdminStatCard, AdminStatGrid } from "@/components/admin/admin-ui";
import { buildAdminHref } from "@/lib/admin/admin-urls";

export function AdminOverview({
  metrics,
}: {
  metrics: {
    moodResults: number;
    clicks: number;
    totalListings: number;
    missingDrink: number;
    missingFood: number;
  };
}) {
  return (
    <div className="space-y-4">
      <AdminPanel title="At a glance" description="Key counts only — open a tab below for detail.">
        <AdminStatGrid>
          <AdminStatCard label="Catalog listings" value={metrics.totalListings} href={buildAdminHref("catalog")} />
          <AdminStatCard label="Mood results" value={metrics.moodResults} />
          <AdminStatCard label="Recommendation clicks" value={metrics.clicks} />
          <AdminStatCard
            label="Missing drink images"
            value={metrics.missingDrink}
            href={metrics.missingDrink > 0 ? buildAdminHref("catalog", "missing-drink") : undefined}
            tone={metrics.missingDrink > 0 ? "warn" : "default"}
          />
        </AdminStatGrid>
        {metrics.missingFood > 0 ? (
          <div className="mt-3">
            <AdminStatCard
              label="Missing food images"
              value={metrics.missingFood}
              href={buildAdminHref("catalog", "missing-food")}
              tone="warn"
            />
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel title="Suggested next steps" description="One task at a time keeps the workflow simple.">
        <ul className="space-y-2 text-sm text-white/70">
          {metrics.totalListings === 0 ? (
            <li>
              <Link href={buildAdminHref("import")} className="text-[var(--hs-accent)] hover:underline">
                Import your catalog CSV
              </Link>{" "}
              or{" "}
              <Link href={buildAdminHref("add")} className="text-[var(--hs-accent)] hover:underline">
                add a single listing
              </Link>
              .
            </li>
          ) : null}
          {metrics.missingDrink > 0 || metrics.missingFood > 0 ? (
            <li>
              <Link
                href={buildAdminHref("catalog", metrics.missingDrink > 0 ? "missing-drink" : "missing-food")}
                className="text-[var(--hs-accent)] hover:underline"
              >
                Attach missing images
              </Link>{" "}
              — upload in Media, then edit listings in Catalog.
            </li>
          ) : null}
          <li>
            <Link href={buildAdminHref("media")} className="text-[var(--hs-accent)] hover:underline">
              Manage media library
            </Link>
          </li>
        </ul>
      </AdminPanel>
    </div>
  );
}
