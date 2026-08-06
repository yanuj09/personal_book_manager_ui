# Personal Book Manager UI

A responsive, theme-aware frontend for a personal reading tracker built with Next.js App Router.

## Features

- Authentication flow (login and signup)
- Protected app shell with responsive sidebar and mobile drawer
- Dashboard with reading stats and quick-add
- Collection page with search, status filters, tags, and sorting
- Add, edit, and detail pages for books
- Settings page with:
	- profile update
	- password update
	- theme preference (light, dark, system)
	- export collection
	- clear collection
- Toast notifications and loading states
- Mock backend support for local frontend-only development

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open http://localhost:3000

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Route Map

- `/` smart redirect to login or dashboard based on session
- `/login`
- `/signup`
- `/dashboard`
- `/collection`
- `/books/new`
- `/books/[id]`
- `/books/[id]/edit`
- `/settings`

## Backend Mode

This project runs with a browser mock backend by default.

- If `NEXT_PUBLIC_API_URL` is empty, it uses the local mock backend.
- If `NEXT_PUBLIC_API_URL` is set, services call the real API.

## Notes

- Auth token and cached user are stored in localStorage.
- Mock data is persisted in localStorage per user.
