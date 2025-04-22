import type { Route } from "./+types/reviews";

import prisma from "../db"; 
import { Button, Container, Group, Stack, Title, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              reviews: true
            }
          }
        }
      },
      book: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: [
      {
        user: {
          reviews: {
            _count: 'desc'
          }
        }
      },
      {
        createdAt: 'desc'
      }
    ]
  });

  return { reviews };
}

export default function Review({ loaderData }: Route.ComponentProps) {
  const { reviews } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Reviews</Title>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => navigate("/reviews/new")}
          >
            New Review
          </Button>
        </Group>

        {reviews.length === 0 ? (
          <Text>No reviews yet. Be the first to add one!</Text>
        ) : (
          <Stack gap="md">
            {reviews.map((review) => (
              <div key={review.id}>
                <Text size="lg" fw={500}>
                  {review.book.title}
                </Text>
                <Text c="dimmed">by {review.user.name}</Text>
                <Text>{review.review}</Text>
                <Text c="dimmed" size="sm">
                  {review.user._count.reviews >= 3 ? "⭐ Premier Reviewer" : ""}
                </Text>
              </div>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
