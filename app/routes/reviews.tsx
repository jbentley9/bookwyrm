import '@mantine/core/styles.css';
import type { Route } from "./+types/reviews";
import prisma from "../db"; 
import { Button, Container, Group, Stack, Title, Text, Card, Rating, Avatar, Badge } from "@mantine/core";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "react-router";
import { format } from 'date-fns';
import ReviewsGrid from "./reviews.grid";

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
  console.log('Loader function called');
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
  console.log('Reviews fetched:', reviews);
  return { reviews };
}

export default function Reviews() {
  const { reviews } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  console.log('Reviews component received:', reviews);

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
        <ReviewsGrid reviews={reviews} />
      </Stack>
    </Container>
  );
}
