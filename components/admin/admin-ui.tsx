"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { buildAdminHref } from "@/lib/admin/admin-urls";
import type { AdminTab } from "@/lib/admin/listing-filters";
import { ADMIN_TABS } from "@/lib/admin/listing-filters";

export function AdminPanel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/20 ${className}`}
    >
      {title ? (
        <header className="border-b border-white/8 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-white/45">{description}</p> : null}
        </header>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function AdminTabNav({ activeTab }: { activeTab: AdminTab }) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-1"
      aria-label="Admin sections"
    >
      {ADMIN_TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={buildAdminHref(tab.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
              active
                ? "bg-[var(--hs-accent)] text-white shadow-sm"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function AdminStatCard({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  href?: string;
  tone?: "default" | "warn";
}) {
  const inner = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "warn" ? "text-amber-200" : "text-white"}`}>
        {value}
      </p>
    </>
  );

  const className = `rounded-xl border px-4 py-3 ${
    tone === "warn"
      ? "border-amber-400/20 bg-amber-500/[0.06]"
      : "border-white/10 bg-black/20"
  } ${href ? "transition hover:border-[var(--hs-accent)]/35 hover:bg-white/[0.04]" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

export function AdminField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-white/55">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-white/35">{hint}</span> : null}
    </label>
  );
}

export const adminInputClass =
  "w-full rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--hs-accent)]/50";

export const adminSelectClass = `${adminInputClass} appearance-none`;

export function AdminDataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-black/15 px-6 py-10 text-center">
      <p className="font-medium text-white/75">{title}</p>
      {description ? <p className="mt-1 text-sm text-white/40">{description}</p> : null}
    </div>
  );
}

export function AdminDetails({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="rounded-xl border border-white/10 bg-black/20 open:border-white/15"
      open={defaultOpen || undefined}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white/80 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {summary}
          <span className="text-xs text-white/35">Show</span>
        </span>
      </summary>
      <div className="border-t border-white/8 px-4 py-4">{children}</div>
    </details>
  );
}
