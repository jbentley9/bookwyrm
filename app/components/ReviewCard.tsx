import { Card, Group, Text, Avatar, Rating } from "@mantine/core";
import type { Review, User, Book } from "@prisma/client";

type ReviewWithUserAndBook = Review & {
  user: Pick<User, 'name'>;
  book: Pick<Book, 'title'>;
};

interface ReviewCardProps {
  review: ReviewWithUserAndBook;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group>
          <Avatar color="blue" radius="xl">
            {review.user.name.charAt(0)}
          </Avatar>
          <div>
            <Text fw={500}>{review.user.name}</Text>
            <Text size="sm" c="dimmed">{review.book.title}</Text>
          </div>
        </Group>
        <Rating value={review.rating} readOnly />
      </Group>
      <Text>{review.review}</Text>
    </Card>
  );
} 