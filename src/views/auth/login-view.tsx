"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { useAuthForm } from "@/controllers/use-auth-form";
import { routes } from "@/lib/routes";
import { FormAlert } from "./form-alert";

export function LoginView() {
  const { values, errors, formError, submitting, setField, submit } =
    useAuthForm("login");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="text-sm text-ink-muted">
          Pick up where you left off.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={formError} />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={(event) => setField("email", event.target.value)}
        />

        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            error={errors.password}
            onChange={(event) => setField("password", event.target.value)}
          />
        </div>

        <Button type="submit" fullWidth loading={submitting}>
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link
          href={routes.signup}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
