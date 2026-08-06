"use client";

import { useRedirectIfAuthenticated } from "@/controllers/use-require-auth";
import { LoginView } from "@/views/auth/login-view";
import { LoadingPanel } from "@/components/ui/spinner";

export default function LoginPage() {
  const status = useRedirectIfAuthenticated();

  if (status === "loading") {
    return <LoadingPanel label="Checking your session" />;
  }

  return <LoginView />;
}
