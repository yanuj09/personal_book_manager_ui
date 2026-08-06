import { IconAlert } from "@/components/ui/icons";

/** Form-level error banner. Renders nothing when there's nothing to say. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger ring-1 ring-danger/20"
    >
      <IconAlert className="mt-0.5 shrink-0 text-base" />
      <p className="leading-snug">{message}</p>
    </div>
  );
}
