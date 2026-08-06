"use client";

import {
  BOOK_STATUS_LIST,
  SORT_OPTIONS,
  type BookStatus,
  type SortOption,
} from "@/models/book.model";
import { FilterPill } from "@/components/ui/filter-pill";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconSearch } from "@/components/ui/icons";

interface FilterBarProps {
  query: string;
  status: BookStatus | "all";
  activeTags: string[];
  availableTags: string[];
  sort: SortOption;
  counts: { total: number; byStatus: Record<BookStatus, number> };
  isFiltered: boolean;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: BookStatus | "all") => void;
  onTagToggle: (tag: string) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

export function FilterBar({
  query,
  status,
  activeTags,
  availableTags,
  sort,
  counts,
  isFiltered,
  onQueryChange,
  onStatusChange,
  onTagToggle,
  onSortChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Search by title, author or tag…"
          aria-label="Search your collection"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          leading={<IconSearch className="text-base" />}
          fieldClassName="flex-1"
        />
        <Select
          aria-label="Sort books"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          fieldClassName="sm:w-56"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-xs font-medium text-ink-subtle">Status</span>
        <FilterPill active={status === "all"} onClick={() => onStatusChange("all")} count={counts.total}>
          All
        </FilterPill>
        {BOOK_STATUS_LIST.map((meta) => (
          <FilterPill
            key={meta.value}
            active={status === meta.value}
            onClick={() => onStatusChange(meta.value)}
            activeClassName={meta.pillActiveClass}
            count={counts.byStatus[meta.value]}
          >
            <span aria-hidden="true">{meta.emoji}</span>
            {meta.label}
          </FilterPill>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-xs font-medium text-ink-subtle">Tags</span>
          {availableTags.map((tag) => (
            <FilterPill
              key={tag}
              active={activeTags.includes(tag)}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </FilterPill>
          ))}
        </div>
      )}

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
