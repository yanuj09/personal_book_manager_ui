"use client";

import type { ReactNode } from "react";
import { useRequireAuth } from "@/controllers/use-require-auth";
import { BooksProvider } from "@/controllers/books-controller";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingPanel } from "@/components/ui/spinner";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const status = useRequireAuth();

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingPanel label="Verifying access" />
      </div>
    );
  }

  return (
    <BooksProvider>
      <AppShell>{children}</AppShell>
    </BooksProvider>
  );
}
