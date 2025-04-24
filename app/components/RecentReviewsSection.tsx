import { Title, Button, Stack, Group, Grid } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router";
import { ReviewCard } from "./ReviewCard";
import type { Review, User, Book } from "@prisma/client";

type ReviewWithUserAndBook = Review & {
  user: Pick<User, 'name'>;
  book: Pick<Book, 'title'>;
};

interface RecentReviewsSectionProps {
  reviews: ReviewWithUserAndBook[];
}

export function RecentReviewsSection({ reviews }: RecentReviewsSectionProps) {
  return (
    <Stack py="xl" gap="lg">
      <Group justify="space-between">
        <Title order={2}>Recent Reviews</Title>
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
        {reviews.map((review) => (
          <Grid.Col key={review.id} span={{ base: 12, sm: 6 }}>
            <ReviewCard review={review} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
} 