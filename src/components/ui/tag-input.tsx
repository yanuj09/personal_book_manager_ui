"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { SUGGESTED_TAGS } from "@/models/book.model";
import { controlStyles, Field } from "./field";
import { IconClose, IconPlus } from "./icons";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  error?: string;
  hint?: string;
  max?: number;
}

/**
 * Chip-style tag picker: click a suggestion or type your own.
 *
 * Tags are free text, but the suggestions keep a collection from fragmenting
 * into "sci-fi", "Sci Fi" and "SciFi".
 */
export function TagInput({
  value,
  onChange,
  label = "Tags",
  error,
  hint,
  max = 8,
}: TagInputProps) {
  const [entry, setEntry] = useState("");
  const inputId = useId();

  const atLimit = value.length >= max;

  const suggestions = useMemo(() => {
    const chosen = new Set(value.map((tag) => tag.toLowerCase()));
    return SUGGESTED_TAGS.filter((tag) => !chosen.has(tag.toLowerCase()));
  }, [value]);

  function addTag(raw: string) {
    const tag = raw.trim().replace(/\s+/g, " ");
    if (!tag || atLimit) return;
    // Case-insensitive de-dupe, but keep the casing the user typed.
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setEntry("");
      return;
    }
    onChange([...value, tag]);
    setEntry("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      // Enter should add a tag, not submit the surrounding form.
      event.preventDefault();
      addTag(entry);
    } else if (event.key === "Backspace" && !entry && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <Field
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint ?? `Up to ${max}. Press Enter to add your own.`}
      addon={
        <span className="text-[11px] tabular-nums text-ink-subtle">
          {value.length} / {max}
        </span>
      }
    >
      <div className="space-y-2.5">
        {value.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {value.map((tag) => (
              <li key={tag}>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-2.5 pr-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <IconClose className="text-[11px]" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            id={inputId}
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => addTag(entry)}
            disabled={atLimit}
            placeholder={atLimit ? `Tag limit reached` : "Add a tag…"}
            className={cn(controlStyles, "h-9")}
          />
          <button
            type="button"
            onClick={() => addTag(entry)}
            disabled={!entry.trim() || atLimit}
            aria-label="Add tag"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border-base transition-colors hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <IconPlus />
          </button>
        </div>

        {!atLimit && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="rounded-full px-2.5 py-1 text-xs text-ink-muted ring-1 ring-border-base transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}
