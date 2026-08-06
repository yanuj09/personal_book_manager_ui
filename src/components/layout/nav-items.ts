import {
  IconCollection,
  IconDashboard,
  IconPlus,
  IconSettings,
} from "@/components/ui/icons";
import { routes } from "@/lib/routes";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof IconDashboard;
  /** Also highlight this item for nested paths, e.g. /books/123 → Collection. */
  matchPrefixes?: string[];
}

/** The primary navigation, shared by the desktop sidebar and the mobile drawer. */
export const NAV_ITEMS: NavItem[] = [
  { href: routes.dashboard, label: "Dashboard", icon: IconDashboard },
  {
    href: routes.collection,
    label: "My Collection",
    icon: IconCollection,
    matchPrefixes: ["/books"],
  },
  { href: routes.newBook, label: "Add New Book", icon: IconPlus },
  { href: routes.settings, label: "Settings", icon: IconSettings },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  // "Add New Book" is an exact match only — /books/new must not light up
  // Collection as well.
  if (item.href === routes.newBook) return false;
  return (item.matchPrefixes ?? []).some((prefix) =>
    pathname.startsWith(prefix),
  );
}
