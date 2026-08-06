import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldProps {
  label?: string;
  /** Id of the control this label points at. */
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Right-aligned slot on the label row, e.g. a character counter. */
  addon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + message, laid out the same way everywhere.
 *
 * Every form control composes this, so spacing, error colour and the
 * `aria-describedby` wiring are decided once.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  addon,
  className,
  children,
}: FieldProps) {
  const message = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || addon) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label
              htmlFor={htmlFor}
              className="text-xs font-medium tracking-wide text-ink-muted"
            >
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
          )}
          {addon}
        </div>
      )}

      {children}

      {message && (
        <p
          id={htmlFor ? `${htmlFor}-message` : undefined}
          className={cn(
            "text-xs leading-snug",
            error ? "text-danger" : "text-ink-subtle",
          )}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}

/** Shared look for every text-ish control. */
export const controlStyles =
  "w-full rounded-lg bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle " +
  "ring-1 ring-border-base transition-shadow duration-150 " +
  "hover:ring-border-strong focus:outline-none focus:ring-2 focus:ring-primary " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const controlErrorStyles = "ring-danger focus:ring-danger";
