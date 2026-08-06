"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { controlErrorStyles, controlStyles, Field } from "./field";
import { IconEye, IconEyeOff } from "./icons";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  /** Rendered inside the control, on the left. */
  leading?: ReactNode;
  fieldClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leading,
  fieldClassName,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={fieldClassName}
    >
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-message` : undefined}
          className={cn(
            controlStyles,
            "h-10",
            leading && "pl-9",
            error && controlErrorStyles,
            className,
          )}
          {...props}
        />
      </div>
    </Field>
  );
}

/**
 * Password field with a show/hide toggle — the pattern the mockups use on both
 * the login and signup forms.
 */
export function PasswordInput({
  label,
  error,
  hint,
  fieldClassName,
  className,
  id,
  required,
  ...props
}: Omit<InputProps, "leading" | "type">) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [revealed, setRevealed] = useState(false);

  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
      className={fieldClassName}
    >
      <div className="relative">
        <input
          id={inputId}
          type={revealed ? "text" : "password"}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-message` : undefined}
          className={cn(
            controlStyles,
            "h-10 pr-10",
            error && controlErrorStyles,
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          {revealed ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    </Field>
  );
}
