"use client";

import Image from "next/image";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

type ResultHeroImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
};

/** Hero card image with shimmer/spinner until the uploaded asset has loaded. */
export function ResultHeroImage({ src, alt, sizes = "(max-width: 1024px) 100vw, 50vw", priority }: ResultHeroImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d0b14]">
      {!loaded ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#12101a_0%,#1a1528_50%,#12101a_100%)]"
          aria-hidden
        >
          <span className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="hs-btn-shimmer-bar absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-90" />
          </span>
          <Spinner className="relative z-[1] h-7 w-7 text-white/70" />
          <span className="relative z-[1] text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
            Loading image…
          </span>
        </div>
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
