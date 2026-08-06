"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { useAuthForm } from "@/controllers/use-auth-form";
import { LIMITS } from "@/models/validation";
import { routes } from "@/lib/routes";
import { FormAlert } from "./form-alert";

export function SignupView() {
  const { values, errors, formError, submitting, setField, submit } =
    useAuthForm("signup");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Start your shelf
        </h1>
        <p className="text-sm text-ink-muted">
          A quiet place for everything you&rsquo;re reading.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={formError} />

        <Input
          label="Name"
          autoComplete="name"
          placeholder="Alex Reader"
          value={values.name}
          error={errors.name}
          onChange={(event) => setField("name", event.target.value)}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={(event) => setField("email", event.target.value)}
        />

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          hint={`At least ${LIMITS.passwordMin} characters.`}
          onChange={(event) => setField("password", event.target.value)}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href={routes.login}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
