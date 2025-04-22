import '@mantine/core/styles.css';
import type { Route } from "./+types/reviews";
import prisma from "../db"; 
import { Button, Container, Group, Stack, Title, Text, Card, Rating, Avatar, Badge } from "@mantine/core";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "react-router";
import { format } from 'date-fns';

type Review = {
  id: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    _count: {
      reviews: number;
    };
  };
  book: {
    id: string;
    title: string;
  };
};

export async function loader({ request }: Route.LoaderArgs) {
  //console.log('Loader function called');
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

  //console.log('Reviews fetched');
  return { reviews };
}

export default function Review({ loaderData }: Route.ComponentProps) {
  //console.log('Component rendered with loaderData:', loaderData);
  const { reviews } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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
            onClick={() => navigate("/reviews/new")}
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
                    <Group>
                    <Text fw={500}>{review.user.name}</Text>
                    <Text size="xs" c="dimmed">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </Text>
                    {review.user._count.reviews >= 1 && (
                    <Badge color="blue" variant="light">
                      Premier Reviewer
                    </Badge>
                  )}
                    </Group>
                  </div>
                </Group>
                <Group>
                  <Rating value={review.rating} readOnly />
                  
                </Group>
              </Group>

              <Text fw={500} size="lg" mt="md">
                {review.book.title}
              </Text>

              <Text mt="xs" c="dimmed" size="sm">
                {review.review}
              </Text>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
