"use client";

import { useRouter } from "next/navigation";
import { useNavigationLoading } from "@/components/navigation/NavigationLoadingProvider";

type ViewResultLinkProps = {
  href: string;
  className?: string;
  children?: React.ReactNode;
  onNavigate?: () => void;
};

export function ViewResultLink({
  href,
  className,
  children = "View",
  onNavigate,
}: ViewResultLinkProps) {
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        startNavigation(href, "Opening your mood reveal…");
        onNavigate?.();
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}
