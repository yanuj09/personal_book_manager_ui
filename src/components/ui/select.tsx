"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlErrorStyles, controlStyles, Field } from "./field";
import { IconChevronDown } from "./icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: readonly SelectOption[];
  fieldClassName?: string;
}

/**
 * A native `<select>` with the chrome restyled.
 *
 * Native beats a custom listbox here: it gets keyboard support, screen-reader
 * behaviour and the correct mobile picker for free.
 */
export function Select({
  label,
  error,
  hint,
  options,
  fieldClassName,
  className,
  id,
  required,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Field
      label={label}
      htmlFor={selectId}
      error={error}
      hint={hint}
      required={required}
      className={fieldClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${selectId}-message` : undefined}
          className={cn(
            controlStyles,
            "h-10 cursor-pointer appearance-none pr-9",
            error && controlErrorStyles,
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
      </div>
    </Field>
  );
}
