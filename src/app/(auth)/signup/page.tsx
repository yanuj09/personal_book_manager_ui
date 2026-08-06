"use client";

import { useRedirectIfAuthenticated } from "@/controllers/use-require-auth";
import { SignupView } from "@/views/auth/signup-view";
import { LoadingPanel } from "@/components/ui/spinner";

export default function SignupPage() {
  const status = useRedirectIfAuthenticated();

  if (status === "loading") {
    return <LoadingPanel label="Checking your session" />;
  }

  return <SignupView />;
}
