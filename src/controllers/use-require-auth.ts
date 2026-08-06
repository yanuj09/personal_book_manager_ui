"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthStatus } from "@/providers/auth-provider";
import { routes } from "@/lib/routes";

/**
 * Route guard for the authenticated area.
 *
 * The JWT lives in localStorage, so the check has to happen on the client —
 * middleware can't see it. Returning `status` lets the layout render a neutral
 * shell while the session is still being restored, instead of flashing the app
 * and then bouncing to the login page.
 */
export function useRequireAuth(): AuthStatus {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(routes.login);
  }, [status, router]);

  return status;
}

/** The mirror image: keeps signed-in readers out of the login and signup pages. */
export function useRedirectIfAuthenticated(): AuthStatus {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace(routes.dashboard);
  }, [status, router]);

  return status;
}
