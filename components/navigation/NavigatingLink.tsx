"use client";

import { useRouter } from "next/navigation";
import { useNavigationLoading } from "@/components/navigation/NavigationLoadingProvider";

type NavigatingLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  message?: string;
  onClick?: () => void;
};

/** Client navigation with immediate full-screen loading (avoids flashing the previous page). */
export function NavigatingLink({ href, children, className, message, onClick }: NavigatingLinkProps) {
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        startNavigation(href, message);
        onClick?.();
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}
