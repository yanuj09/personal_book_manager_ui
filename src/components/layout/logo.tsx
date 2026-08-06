import Link from "next/link";
import { cn } from "@/lib/cn";
import { env } from "@/config/env";
import { Wordmark } from "@/components/ui/icons";
import { routes } from "@/lib/routes";

interface LogoProps {
  href?: string;
  className?: string;
  /** Hides the wordmark text, keeping only the mark. */
  compact?: boolean;
}

export function Logo({ href = routes.dashboard, className, compact }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-ink transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Wordmark className="text-xl text-primary" />
      {!compact && (
        <span className="text-base font-semibold tracking-tight">
          {env.appName}
        </span>
      )}
    </Link>
  );
}
