"use client";

import { useFormStatus } from "react-dom";
import { PrimaryButton, type PrimaryButtonProps } from "@/components/ui/PrimaryButton";

type FormSubmitButtonProps = Omit<PrimaryButtonProps, "type" | "loading">;

/**
 * Submit button wired to the nearest parent `<form>` pending state (React 19 `useFormStatus`).
 */
export function FormSubmitButton({ children, disabled, ...props }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const busy = Boolean(pending || disabled);

  return (
    <PrimaryButton type="submit" loading={pending} disabled={busy} {...props}>
      {children}
    </PrimaryButton>
  );
}
