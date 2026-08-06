import { EditBookView } from "@/views/books/book-form-view";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  return <EditBookView id={id} />;
}
