"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import {
  emptyBookDraft,
  reconcileProgress,
  type BookDraft,
} from "@/models/book.model";
import {
  isValid,
  validateBookDraft,
  type FieldErrors,
} from "@/models/validation";
import { ApiError } from "@/services/api-error";

interface UseBookFormOptions {
  initial?: BookDraft;
  onSubmit: (draft: BookDraft) => Promise<void>;
}

/**
 * Form state for adding and editing a book.
 *
 * Validation lives in the model, not here — this hook only decides *when* to
 * run it. Errors stay quiet until the first submit attempt, then update live so
 * the user can see themselves fixing the problem.
 */
export function useBookForm({ initial, onSubmit }: UseBookFormOptions) {
  const baseline = useMemo(() => initial ?? emptyBookDraft(), [initial]);

  const [draft, setDraft] = useState<BookDraft>(baseline);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<FieldErrors<BookDraft>>({});

  const errors: FieldErrors<BookDraft> = useMemo(() => {
    if (!submitted) return serverErrors;
    return { ...validateBookDraft(draft), ...serverErrors };
  }, [draft, submitted, serverErrors]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  const setField = useCallback(
    <K extends keyof BookDraft>(key: K, value: BookDraft[K]) => {
      setDraft((current) => {
        const next = { ...current, [key]: value };
        // Changing status re-derives progress, so "Completed" can't sit at 40%.
        return key === "status" ? reconcileProgress(next) : next;
      });
      // A field the user just edited should stop showing a stale server error.
      setServerErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setDraft(baseline);
    setSubmitted(false);
    setFormError(null);
    setServerErrors({});
  }, [baseline]);

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      setSubmitted(true);
      setFormError(null);
      setServerErrors({});

      const validationErrors = validateBookDraft(draft);
      if (!isValid(validationErrors)) return false;

      setSubmitting(true);
      try {
        await onSubmit(reconcileProgress(draft));
        return true;
      } catch (caught) {
        if (caught instanceof ApiError) {
          setFormError(caught.message);
          setServerErrors(caught.fieldErrors as FieldErrors<BookDraft>);
        } else {
          setFormError("Something went wrong. Please try again.");
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [draft, onSubmit],
  );

  return {
    draft,
    errors,
    formError,
    submitting,
    isDirty,
    setField,
    setDraft,
    submit,
    reset,
  };
}
