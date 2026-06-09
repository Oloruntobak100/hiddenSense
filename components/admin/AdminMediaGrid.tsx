import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
import { listMediaAssets } from "@/lib/admin/media-assets";

export async function AdminMediaGrid() {
  const assets = await listMediaAssets();

  if (assets.length === 0) {
    return <p className="mt-4 text-xs text-white/45">No images uploaded yet.</p>;
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="overflow-hidden rounded-2xl border border-white/12 bg-black/20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.public_url} alt={asset.label} className="aspect-square w-full object-cover" />
          <div className="flex items-start justify-between gap-2 p-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{asset.label}</p>
              <p className="truncate text-[10px] text-white/45">{asset.slug}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/35">{asset.kind}</p>
            </div>
            <DeleteMediaButton id={asset.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
