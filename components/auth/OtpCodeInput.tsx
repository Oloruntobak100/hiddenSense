"use client";

import { useCallback, useEffect, useId, useRef } from "react";

const DEFAULT_LENGTH = 6;

type OtpCodeInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
};

function sanitizeDigits(raw: string, maxLength: number) {
  return raw.replace(/\D/g, "").slice(0, maxLength);
}

export function OtpCodeInput({
  length = DEFAULT_LENGTH,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  "aria-label": ariaLabel = "Verification code",
}: OtpCodeInputProps) {
  const inputId = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = sanitizeDigits(value, length).padEnd(length, " ").split("").map((c) => (c === " " ? "" : c));

  const focusIndex = useCallback((index: number) => {
    const el = refs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && !disabled) focusIndex(0);
  }, [autoFocus, disabled, focusIndex]);

  function emit(next: string) {
    const clean = sanitizeDigits(next, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function handleChange(index: number, raw: string) {
    const chunk = sanitizeDigits(raw, length);
    if (!chunk) {
      const chars = [...digits];
      chars[index] = "";
      emit(chars.join(""));
      return;
    }

    if (chunk.length > 1) {
      emit(chunk);
      focusIndex(Math.min(chunk.length, length) - 1);
      return;
    }

    const chars = [...digits];
    chars[index] = chunk;
    const next = chars.join("");
    emit(next);
    if (index < length - 1) focusIndex(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const chars = [...digits];
      chars[index - 1] = "";
      emit(chars.join(""));
      focusIndex(index - 1);
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = sanitizeDigits(e.clipboardData.getData("text"), length);
    if (!pasted) return;
    emit(pasted);
    focusIndex(Math.min(pasted.length, length) - 1);
  }

  return (
    <div
      className="flex justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={`${inputId}-${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digits[index]}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="h-12 w-10 rounded-xl border border-black/[0.09] bg-white text-center font-mono text-xl font-semibold text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18 disabled:opacity-60 sm:h-14 sm:w-12 sm:text-2xl"
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
