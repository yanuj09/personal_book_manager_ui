"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { initialsOf } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import { IconLogout } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "./logo";
import { isNavItemActive, NAV_ITEMS } from "./nav-items";

interface SidebarProps {
  /** Called after a nav link is followed, so the mobile drawer can close. */
  onNavigate?: () => void;
}

/**
 * The persistent navigation column.
 *
 * The same component serves the desktop rail and the mobile drawer — only the
 * container around it differs, so the two can't fall out of sync.
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 scrollbar-slim">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            const ItemIcon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                  )}
                >
                  <ItemIcon
                    className={cn(
                      "text-base transition-colors",
                      active
                        ? "text-primary"
                        : "text-ink-subtle group-hover:text-ink-muted",
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-border-base p-3">
        <div className="flex items-center gap-3 px-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
          >
            {initialsOf(user?.name ?? "")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.name ?? "Reader"}
            </p>
            <p className="truncate text-xs text-ink-subtle">
              {user?.email ?? ""}
            </p>
          </div>
          <ThemeToggle className="h-8 w-8 shrink-0 ring-0 hover:ring-1" />
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <IconLogout className="text-base" />
          Log out
        </button>
      </div>
    </div>
  );
}
