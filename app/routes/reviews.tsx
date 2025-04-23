import '@mantine/core/styles.css';
import type { Route } from "./+types/reviews";
import prisma from "../db"; 
import { Button, Container, Group, Stack, Title, Text, Card, Rating, Avatar, Badge } from "@mantine/core";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  //console.log('Loader function called');
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          name: true
        }
      },
      book: {
        select: {
          title: true
        }
      }
    }
  });
  //console.log('Reviews fetched:', reviews);
  return { reviews };
}

export default function Reviews() {
  const { reviews } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  //console.log('Reviews component received:', reviews);

  if (!reviews) {
    return <Text>Loading reviews...</Text>;
  }

  if (reviews.length === 0) {
    return <Text>No reviews found.</Text>;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Reviews</Title>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => navigate('/reviews/new')}
          >
            New Review
          </Button>
        </Group>

        <Stack gap="md">
          {reviews.map((review) => (
            <Card key={review.id} withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="xs">
                <Group>
                  <Avatar color="blue" radius="xl">
                    <IconUser size="1.5rem" />
                  </Avatar>
                  <div>
                    <Text fw={500}>{review.user.name}</Text>
                    <Text size="xs" c="dimmed">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </Group>
                <Rating value={review.rating} readOnly />
              </Group>

              <Text fw={500} size="lg" mb="xs">
                {review.book.title}
              </Text>

              <Text size="sm" c="dimmed" mb="md">
                {review.review}
              </Text>

              <Group>
                <Badge color="blue" variant="light">
                  {review.rating} stars
                </Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
