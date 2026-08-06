"use client";

import { cn } from "@/lib/cn";
import { useTheme, type ThemePreference } from "@/providers/theme-provider";
import { IconMonitor, IconMoon, IconSun } from "./icons";

/** Compact icon button for the top bar. Flips between light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const goingDark = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      title={goingDark ? "Switch to dark" : "Switch to light"}
      aria-label={goingDark ? "Switch to dark theme" : "Switch to light theme"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border-base transition-colors hover:bg-surface-sunken hover:text-ink",
        className,
      )}
    >
      {/* Both icons are mounted and cross-faded, so the swap doesn't jump. */}
      <span className="relative block h-4 w-4">
        <IconSun
          className={cn(
            "absolute inset-0 text-base transition-all duration-200",
            theme === "light"
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0",
          )}
        />
        <IconMoon
          className={cn(
            "absolute inset-0 text-base transition-all duration-200",
            theme === "dark" ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        />
      </span>
    </button>
  );
}

const CHOICES: { value: ThemePreference; label: string; icon: typeof IconSun }[] =
  [
    { value: "light", label: "Light", icon: IconSun },
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "system", label: "System", icon: IconMonitor },
  ];

/** Full three-way control, used on the Settings page. */
export function ThemePreferenceControl() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-3 gap-1.5"
    >
      {CHOICES.map(({ value, label, icon: ChoiceIcon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-xs font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary ring-1 ring-primary/30"
                : "text-ink-muted ring-1 ring-border-base hover:bg-surface-sunken hover:text-ink",
            )}
          >
            <ChoiceIcon className="text-base" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
