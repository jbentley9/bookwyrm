import { Modal, Select, Rating, Textarea, Text, Button, Group, Stack } from "@mantine/core";
import type { Book } from "@prisma/client";

interface ReviewFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  books: Pick<Book, 'id' | 'title'>[];
  rating: number;
  onRatingChange: (value: number) => void;
  review: string;
  onReviewChange: (value: string) => void;
  bookId: string;
  onBookIdChange: (value: string) => void;
  error: string | null;
}

export function ReviewFormModal({
  opened,
  onClose,
  onSubmit,
  books,
  rating,
  onRatingChange,
  review,
  onReviewChange,
  bookId,
  onBookIdChange,
  error
}: ReviewFormModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New Review"
      size="lg"
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <Select
            label="Book"
            placeholder="Select a book"
            data={books.map(book => ({ value: book.id, label: book.title }))}
            value={bookId}
            onChange={(value) => onBookIdChange(value || "")}
            required
          />
          <Rating value={rating} onChange={onRatingChange} />
          <Textarea
            label="Review"
            placeholder="Write your review..."
            value={review}
            onChange={(e) => onReviewChange(e.target.value)}
            required
          />
          {error && <Text c="red">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="filled">
              Submit Review
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 