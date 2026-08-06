"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlErrorStyles, controlStyles, Field } from "./field";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Shows "120 / 600" above the control. */
  maxCount?: number;
  fieldClassName?: string;
}

export function Textarea({
  label,
  error,
  hint,
  maxCount,
  fieldClassName,
  className,
  id,
  required,
  value,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const length = typeof value === "string" ? value.length : 0;
  const overBudget = maxCount !== undefined && length > maxCount;

  return (
    <Field
      label={label}
      htmlFor={textareaId}
      error={error}
      hint={hint}
      required={required}
      className={fieldClassName}
      addon={
        maxCount !== undefined ? (
          <span
            className={cn(
              "text-[11px] tabular-nums",
              overBudget ? "text-danger" : "text-ink-subtle",
            )}
          >
            {length} / {maxCount}
          </span>
        ) : undefined
      }
    >
      <textarea
        id={textareaId}
        rows={rows}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${textareaId}-message` : undefined}
        className={cn(
          controlStyles,
          "resize-y py-2.5 leading-relaxed",
          error && controlErrorStyles,
          className,
        )}
        {...props}
      />
    </Field>
  );
}
