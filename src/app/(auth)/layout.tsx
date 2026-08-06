import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90rem_40rem_at_10%_-20%,var(--color-primary-soft),transparent_55%),radial-gradient(75rem_35rem_at_100%_120%,var(--color-accent-soft),transparent_50%)]" />

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <main className="relative z-10 mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:px-10">
        <section className="hidden lg:block">
          <Logo href="/" className="mb-7" />
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight text-ink">
            Keep your personal reading journey organized.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Track what you are reading now, what you finished, and what to pick next.
            Designed to stay clean in both light and dark mode.
          </p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-card bg-surface p-5 shadow-xl ring-1 ring-border-base sm:p-6">
          <div className="mb-6 lg:hidden">
            <Logo href="/" />
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
