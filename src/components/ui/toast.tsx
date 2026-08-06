"use client";

import type { Toast, ToastTone } from "@/providers/toast-provider";
import { cn } from "@/lib/cn";
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from "./icons";

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-success-soft text-success ring-success/25",
  error: "bg-danger-soft text-danger ring-danger/25",
  info: "bg-surface text-ink ring-border-base",
};

const TONE_ICONS: Record<ToastTone, typeof IconInfo> = {
  success: IconCheckCircle,
  error: IconAlert,
  info: IconInfo,
};

/**
 * Rendered once by `ToastProvider`. Bottom-centre on phones, bottom-right from
 * `sm` up, so it never covers the mobile tab bar's primary action.
 */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
    >
      {toasts.map((toast) => {
        const ToneIcon = TONE_ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg px-3.5 py-2.5 text-sm shadow-lg ring-1 backdrop-blur",
              "motion-safe:animate-[toast-in_180ms_ease-out]",
              TONE_STYLES[toast.tone],
            )}
          >
            <ToneIcon className="mt-0.5 shrink-0 text-base" />
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <IconClose className="text-sm" />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
