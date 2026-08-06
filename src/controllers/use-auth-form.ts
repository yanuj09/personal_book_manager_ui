"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Credentials, SignupPayload } from "@/models/user.model";
import {
  isValid,
  validateCredentials,
  validateSignup,
  type FieldErrors,
} from "@/models/validation";
import { ApiError } from "@/services/api-error";
import { useAuth } from "@/providers/auth-provider";
import { routes } from "@/lib/routes";

type Mode = "login" | "signup";

const EMPTY_LOGIN: Credentials = { email: "", password: "" };
const EMPTY_SIGNUP: SignupPayload = { name: "", email: "", password: "" };

/**
 * Login and signup share a shape: collect fields, validate against the model,
 * hand them to the auth provider, and route onward. One hook, two modes, so the
 * two forms can never drift apart in behaviour.
 */
export function useAuthForm(mode: Mode) {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [values, setValues] = useState<SignupPayload>(
    mode === "signup" ? EMPTY_SIGNUP : { ...EMPTY_SIGNUP },
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<FieldErrors<SignupPayload>>(
    {},
  );

  const validate = useCallback(
    (candidate: SignupPayload): FieldErrors<SignupPayload> =>
      mode === "signup"
        ? validateSignup(candidate)
        : validateCredentials(candidate),
    [mode],
  );

  const errors = useMemo(() => {
    if (!submitted) return serverErrors;
    return { ...validate(values), ...serverErrors };
  }, [submitted, values, validate, serverErrors]);

  const setField = useCallback(
    <K extends keyof SignupPayload>(key: K, value: SignupPayload[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setServerErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      setSubmitted(true);
      setFormError(null);
      setServerErrors({});

      if (!isValid(validate(values))) return;

      setSubmitting(true);
      try {
        if (mode === "signup") {
          await signup({
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
          });
        } else {
          await login({
            email: values.email.trim(),
            password: values.password,
          });
        }
        router.replace(routes.dashboard);
      } catch (caught) {
        if (caught instanceof ApiError) {
          setFormError(caught.message);
          setServerErrors(caught.fieldErrors as FieldErrors<SignupPayload>);
        } else {
          setFormError("Something went wrong. Please try again.");
        }
        setSubmitting(false);
      }
      // On success we intentionally stay in the submitting state: the redirect
      // is in flight and re-enabling the button would invite a double submit.
    },
    [mode, values, validate, signup, login, router],
  );

  return { values, errors, formError, submitting, setField, submit };
}

/** Login only needs email + password; this narrows the shared shape. */
export function credentialsOf(values: SignupPayload): Credentials {
  return { email: values.email, password: values.password };
}
