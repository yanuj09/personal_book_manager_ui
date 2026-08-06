import type { BookStatus } from "@/models/book.model";

interface SeedBook {
  title: string;
  author: string;
  description: string;
  tags: string[];
  status: BookStatus;
  progress: number;
  notes?: string;
}

/** A starter shelf, so a brand-new account has something to look at. */
export const SEED_BOOKS: SeedBook[] = [
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A lone astronaut wakes with no memory aboard a ship he doesn't recognise, tasked with saving a dying Earth.",
    tags: ["Sci-Fi", "Fiction"],
    status: "reading",
    progress: 62,
    notes: "Rocky is the best character I've read all year.",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "Between life and death sits a library, and every book is a life you could have lived.",
    tags: ["Fiction", "Philosophy"],
    status: "reading",
    progress: 34,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A sweeping account of how an unremarkable ape came to run the planet.",
    tags: ["Non-Fiction", "History"],
    status: "reading",
    progress: 18,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description:
      "A comfortable hobbit is talked into an uncomfortable adventure involving a dragon.",
    tags: ["Fantasy", "Classic"],
    status: "completed",
    progress: 100,
    notes: "Re-read it every few winters. It never gets old.",
  },
  {
    title: "1984",
    author: "George Orwell",
    description:
      "A civil servant quietly rewrites the past for a state that insists it was never wrong.",
    tags: ["Fiction", "Classic"],
    status: "completed",
    progress: 100,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A shepherd leaves his flock to chase a recurring dream across the desert.",
    tags: ["Fiction", "Philosophy"],
    status: "completed",
    progress: 100,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "Politics, prophecy and spice on a desert planet everyone wants and no one can hold.",
    tags: ["Sci-Fi", "Classic"],
    status: "want-to-read",
    progress: 0,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A man throws enormous parties for an audience of one, and she never quite arrives.",
    tags: ["Fiction", "Classic"],
    status: "want-to-read",
    progress: 0,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A woman raised off the grid in Idaho teaches herself enough to reach Cambridge.",
    tags: ["Biography", "Non-Fiction"],
    status: "want-to-read",
    progress: 0,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description:
      "The two systems that drive the way we think, and how reliably one of them fools us.",
    tags: ["Non-Fiction", "Philosophy"],
    status: "want-to-read",
    progress: 0,
  },
];
