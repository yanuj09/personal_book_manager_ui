import { BookDetailView } from "@/views/books/book-detail-view";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  return <BookDetailView id={id} />;
}
