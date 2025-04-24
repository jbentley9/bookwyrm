import '@mantine/core/styles.css';
import type { Route } from "./+types/reviews";
import prisma from "../db"; 
import { Button, Container, Group, Stack, Title, Text, Card, Rating, Avatar, Badge, Modal, TextInput, Textarea, Select, ActionIcon, Menu, Box } from "@mantine/core";
import { IconPlus, IconUser, IconSearch, IconX, IconFilter } from "@tabler/icons-react";
import { useLoaderData, useNavigate, redirect } from "react-router";
import { useState, useCallback } from "react";
import { getUser } from "../utils/auth-user";
import { useDebouncedValue } from '@mantine/hooks';

export async function loader({ request }: Route.LoaderArgs) {
  const sessionUser = await getUser(request);
  let currentUser = null;

  if (sessionUser) {
    currentUser = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { id: true, name: true, email: true }
    });
  }

  const [reviews, books] = await Promise.all([
    prisma.review.findMany({
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
    }),
    prisma.book.findMany({
      select: {
        id: true,
        title: true
      }
    })
  ]);

  return { reviews, currentUser, books };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const bookId = formData.get("bookId") as string;
  const rating = Number(formData.get("rating"));
  const review = formData.get("review") as string;

  if (!userId || !bookId || !rating || !review) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Check if user already has a review for this book
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      bookId
    }
  });

  if (existingReview) {
    return new Response(JSON.stringify({ error: 'You have already reviewed this book' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    await prisma.review.create({
      data: {
        userId,
        bookId,
        rating,
        review
      }
    });

    return redirect("/all-reviews");
  } catch (error) {
    console.error('Failed to create review:', error);
    return new Response(JSON.stringify({ error: 'Failed to create review' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

type SearchFilter = 'all' | 'book' | 'review' | 'user';

export default function Reviews() {
  const { reviews, currentUser, books } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [bookId, setBookId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 200);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');
  const navigate = useNavigate();

  // Function to highlight search terms in text
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() 
        ? <mark key={i} style={{ backgroundColor: 'rgba(34, 139, 230, 0.2)' }}>{part}</mark>
        : part
    );
  };

  // Filter reviews based on current view and search term
  const filteredReviews = reviews.filter(review => {
    // First filter by user if in "My Reviews" mode
    if (showMyReviews && currentUser && review.userId !== currentUser.id) {
      return false;
    }

    // Then filter by search term
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      switch (searchFilter) {
        case 'book':
          return review.book.title.toLowerCase().includes(searchLower);
        case 'review':
          return review.review.toLowerCase().includes(searchLower);
        case 'user':
          return review.user.name.toLowerCase().includes(searchLower);
        default:
          return (
            review.book.title.toLowerCase().includes(searchLower) ||
            review.review.toLowerCase().includes(searchLower) ||
            review.user.name.toLowerCase().includes(searchLower)
          );
      }
    }

    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const formData = new FormData();
    formData.append("userId", currentUser.id);
    formData.append("bookId", bookId);
    formData.append("rating", rating.toString());
    formData.append("review", review);
    
    try {
      const response = await fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
      
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (result.error) {
          setError(result.error);
        }
      } else {
        // If not JSON, assume it's a redirect
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Review submission error:', error);
      setError("An error occurred while submitting the review. Please try again.");
    }
  };

  if (!reviews) {
    return <Text>Loading reviews...</Text>;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Reviews</Title>
          {currentUser && (
            <Group>
              <Button
                variant={showMyReviews ? "filled" : "default"}
                onClick={() => setShowMyReviews(!showMyReviews)}
                leftSection={<IconUser size={16} />}
              >
                {showMyReviews ? "All Reviews" : "My Reviews"}
              </Button>
              <Button
                variant="filled"
                onClick={() => setIsModalOpen(true)}
                leftSection={<IconPlus size={16} />}
              >
                New Review
              </Button>
            </Group>
          )}
        </Group>

        <Group style={{ width: '100%' }} gap="xs">
          <TextInput
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
            rightSection={
              searchTerm && (
                <ActionIcon
                  variant="transparent"
                  onClick={() => setSearchTerm("")}
                >
                  <IconX size={16} />
                </ActionIcon>
              )
            }
          />
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="light" size="lg">
                <IconFilter size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Search in</Menu.Label>
              <Menu.Item
                onClick={() => setSearchFilter('all')}
                leftSection={searchFilter === 'all' ? '✓' : ''}
              >
                All fields
              </Menu.Item>
              <Menu.Item
                onClick={() => setSearchFilter('book')}
                leftSection={searchFilter === 'book' ? '✓' : ''}
              >
                Book titles
              </Menu.Item>
              <Menu.Item
                onClick={() => setSearchFilter('review')}
                leftSection={searchFilter === 'review' ? '✓' : ''}
              >
                Review content
              </Menu.Item>
              <Menu.Item
                onClick={() => setSearchFilter('user')}
                leftSection={searchFilter === 'user' ? '✓' : ''}
              >
                User names
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {!currentUser && (
          <Text c="dimmed" ta="center" mt="md">
            Please log in to create reviews and view your personal reviews
          </Text>
        )}

        <Stack gap="md">
          {filteredReviews.map((review) => (
            <Card key={review.id} withBorder>
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
              <Text>{highlightText(review.review, debouncedSearch)}</Text>
            </Card>
          ))}
        </Stack>
      </Stack>

      {currentUser && (
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="New Review"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Select
                label="Book"
                placeholder="Select a book"
                data={books.map(book => ({ value: book.id, label: book.title }))}
                value={bookId}
                onChange={(value) => setBookId(value || "")}
                required
              />
              <Rating value={rating} onChange={setRating} />
              <Textarea
                label="Review"
                placeholder="Write your review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
              />
              {error && <Text c="red">{error}</Text>}
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="filled">
                  Submit Review
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      )}
    </Container>
  );
}
