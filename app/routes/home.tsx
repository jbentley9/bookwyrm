import '@mantine/core/styles.css';
import type { Route } from "./+types/home";
import { Container, Title, Text, Button, Group, Stack, Card, Rating, Avatar, Grid } from "@mantine/core";
import { IconBook, IconStar, IconUser, IconArrowRight } from "@tabler/icons-react";
import { Link, useLoaderData } from "react-router";
import { getUser } from "../utils/auth-user";
import prisma from "../db";
import type { Book, Review, User } from "@prisma/client";

type BookWithReview = Book & {
  reviews: (Review & {
    user: Pick<User, 'name'>;
  })[];
};

type ReviewWithUserAndBook = Review & {
  user: Pick<User, 'name'>;
  book: Pick<Book, 'title'>;
};

export async function loader({ request }: Route.LoaderArgs) {
  const sessionUser = await getUser(request);
  let currentUser = null;

  if (sessionUser) {
    currentUser = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { id: true, name: true, email: true }
    });
  }

  // Get featured books (for now, just get the latest 3)
  const featuredBooks = await prisma.book.findMany({
    take: 3,
    orderBy: { id: 'desc' },
    include: {
      reviews: {
        take: 1,
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });

  // Get recent reviews
  const recentReviews = await prisma.review.findMany({
    take: 4,
    orderBy: { id: 'desc' },
    include: {
      user: {
        select: { name: true }
      },
      book: {
        select: { title: true }
      }
    }
  });

  return { currentUser, featuredBooks, recentReviews };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BookWyrm" },
    { name: "description", content: "Welcome to BookWyrm - Your personal book review platform!" },
  ];
}

export default function Home() {
  const { currentUser, featuredBooks, recentReviews } = useLoaderData<typeof loader>();

  return (
    <Container size="lg" py="xl">
      {/* Hero Section */}
      <Stack align="center" py="xl" gap="md">
        <Title order={1} size="h1" ta="center">
          Welcome to BookWyrm
        </Title>
        <Text size="xl" ta="center" c="dimmed" maw={580}>
          Discover, review, and share your favorite books with the world. Join our community of book lovers today!
        </Text>
        <Group>
          <Button
            component={Link}
            to="/all-reviews"
            size="lg"
            variant="filled"
            leftSection={<IconBook size={20} />}
          >
            Browse Reviews
          </Button>
          {!currentUser && (
            <Button
              component={Link}
              to="/login"
              size="lg"
              variant="light"
              leftSection={<IconUser size={20} />}
            >
              Sign In
            </Button>
          )}
        </Group>
      </Stack>

      {/* Featured Books Section */}
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
          {featuredBooks.map((book: BookWithReview) => (
            <Grid.Col key={book.id} span={{ base: 12, sm: 6, md: 4 }}>
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
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      {/* Recent Reviews Section */}
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
          {recentReviews.map((review: ReviewWithUserAndBook) => (
            <Grid.Col key={review.id} span={{ base: 12, sm: 6 }}>
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
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      {/* User Features Section */}
      {currentUser && (
        <Stack py="xl" gap="lg">
          <Title order={2}>Your BookWyrm</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconBook size={24} />
                  <Text fw={500}>Your Reviews</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  View and manage your book reviews
                </Text>
                <Button
                  component={Link}
                  to="/all-reviews"
                  variant="light"
                  fullWidth
                >
                  View Your Reviews
                </Button>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group mb="md">
                  <IconUser size={24} />
                  <Text fw={500}>Your Account</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Manage your account settings
                </Text>
                <Button
                  component={Link}
                  to="/logout"
                  variant="light"
                  fullWidth
                >
                  Logout
                </Button>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </Container>
  );
}
