import { Title, Button, Stack, Group, Grid } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router";
import { BookCard } from "./BookCard";
import type { Book, Review, User } from "@prisma/client";

type BookWithReview = Book & {
  reviews: (Review & {
    user: Pick<User, 'name'>;
  })[];
};

interface FeaturedBooksSectionProps {
  books: BookWithReview[];
}

export function FeaturedBooksSection({ books }: FeaturedBooksSectionProps) {
  return (
    <Stack py="xl" gap="lg">
      <Group justify="space-between">
        <Title order={2}>Featured Books</Title>
        <Button
          component={Link}
          to="/all-reviews"
          variant="subtle"
          rightSection={<IconArrowRight size={16} />}
        >
          View All Reviews
        </Button>
      </Group>
      <Grid>
        {books.map((book) => (
          <Grid.Col key={book.id} span={{ base: 12, sm: 6, md: 4 }}>
            <BookCard book={book} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
} 