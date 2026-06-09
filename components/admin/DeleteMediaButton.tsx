"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMediaButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this image from the media library?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        window.alert(data.error ?? "Could not delete.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Could not delete.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-200 hover:bg-red-500/15"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
