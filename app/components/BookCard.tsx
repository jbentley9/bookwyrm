import { Card, Stack, Text, Group, Avatar } from "@mantine/core";
import type { Book, Review, User } from "@prisma/client";

type BookWithReview = Book & {
  reviews: (Review & {
    user: Pick<User, 'name'>;
  })[];
};

interface BookCardProps {
  book: BookWithReview;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Text fw={500} size="lg">{book.title}</Text>
        {book.reviews[0] && (
          <Group gap="xs">
            <Avatar size="sm" color="blue">
              {book.reviews[0].user.name.charAt(0)}
            </Avatar>
            <Text size="sm" c="dimmed">
              {book.reviews[0].user.name}'s review
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
} 