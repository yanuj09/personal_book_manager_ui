"use client";

import { useId } from "react";
import { Field } from "@/components/ui/field";

interface ProgressFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

/**
 * Progress slider, shown only while a book's status is "Reading" — the number
 * is meaningless for a book you haven't opened or have already finished.
 */
export function ProgressField({ value, onChange, error }: ProgressFieldProps) {
  const id = useId();

  return (
    <Field
      label="Progress"
      htmlFor={id}
      error={error}
      hint="How far in are you?"
      addon={
        <span className="text-xs font-semibold tabular-nums text-ink">
          {value}%
        </span>
      }
    >
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-accent"
      />
    </Field>
  );
}
