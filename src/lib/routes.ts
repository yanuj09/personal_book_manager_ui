/** Every in-app URL lives here so links never drift from the file tree. */
export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  collection: "/collection",
  newBook: "/books/new",
  book: (id: string) => `/books/${id}`,
  editBook: (id: string) => `/books/${id}/edit`,
  settings: "/settings",
} as const;
