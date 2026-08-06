import type { SVGProps } from "react";

/**
 * Hand-rolled icon set.
 *
 * A dozen icons don't justify an icon-library dependency, and inlining them
 * keeps stroke weight and sizing consistent with the rest of the design.
 * All icons inherit `currentColor` and default to 1em, so they size with text.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
    <path d="M9.5 21v-6h5v6" />
  </Icon>
);

export const IconCollection = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H9v18H5.5A1.5 1.5 0 0 1 4 19.5Z" />
    <path d="M9 3h4.5A1.5 1.5 0 0 1 15 4.5v15a1.5 1.5 0 0 1-1.5 1.5H9Z" />
    <path d="m16.4 5.3 2.9-.8a1 1 0 0 1 1.2.7l3 11.6" transform="translate(-2 1)" />
  </Icon>
);

export const IconPlus = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconSettings = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Icon>
);

export const IconLogout = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);

export const IconSun = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const IconMoon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Icon>
);

export const IconMonitor = (props: IconProps) => (
  <Icon {...props}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
);

export const IconSearch = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const IconSort = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
    <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
  </Icon>
);

export const IconEye = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const IconEyeOff = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.6 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.8 17.8 0 0 1-3.4 4.3" />
    <path d="M6.3 6.4A17.7 17.7 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5-1.3" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m3 3 18 18" />
  </Icon>
);

export const IconCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Icon>
);

export const IconCheckCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
  </Icon>
);

export const IconTrash = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 6h17M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
    <path d="M18.5 6 18 19.6a1.5 1.5 0 0 1-1.5 1.4h-9A1.5 1.5 0 0 1 6 19.6L5.5 6" />
    <path d="M10 10.5v6M14 10.5v6" />
  </Icon>
);

export const IconPencil = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16Z" />
    <path d="m14.5 5.5 4 4" />
  </Icon>
);

export const IconChevronDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const IconChevronLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 5-7 7 7 7" />
  </Icon>
);

export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconMenu = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const IconBookOpen = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 6.5C10.5 5 8.4 4.3 4 4.3V18c4.4 0 6.5.7 8 2.2 1.5-1.5 3.6-2.2 8-2.2V4.3c-4.4 0-6.5.7-8 2.2Z" />
    <path d="M12 6.5v13.7" />
  </Icon>
);

export const IconStack = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5Z" />
    <path d="m3 12.5 9 4.5 9-4.5" />
    <path d="m3 17 9 4.5L21 17" />
  </Icon>
);

export const IconAlert = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.2v.1" />
  </Icon>
);

export const IconInfo = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16.5V11M12 7.8v.1" />
  </Icon>
);

export const IconSparkle = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 11 10.1 9Z" />
    <path d="M18.5 4v3M20 5.5h-3" />
  </Icon>
);

/** Brand mark — a stylised open book / bookmark. */
export const Wordmark = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M4 3.5h16v3.2h-6.2V20.5L12 18.9l-1.8 1.6V6.7H4Z"
      fill="currentColor"
    />
  </svg>
);
