"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { routes } from "@/lib/routes";
import { LoadingPanel } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") router.replace(routes.dashboard);
    if (status === "unauthenticated") router.replace(routes.login);
  }, [status, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingPanel label="Opening your library" />
    </div>
  );
}
