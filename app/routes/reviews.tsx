import '@mantine/core/styles.css';
import type { Route } from "./+types/reviews";
import prisma from "../db"; 
import { Container, Group, Stack, Title, Text } from "@mantine/core";
import { useLoaderData, redirect } from "react-router";
import { useState } from "react";
import { getUser } from "../utils/auth-user";
import { SearchBar } from "../components/SearchBar";
import { ReviewFormModal } from "../components/ReviewFormModal";
import { ReviewControls } from "../components/ReviewControls";
import { ReviewCard } from "../components/ReviewCard";

type SearchFilter = 'all' | 'book' | 'review' | 'user';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "All Reviews | BookWyrm" },
    { name: "description", content: "Browse and read all book reviews in the BookWyrm community." },
  ];
}

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

export default function Reviews() {
  const { reviews, currentUser, books } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [bookId, setBookId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

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
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
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
            <ReviewControls
              showMyReviews={showMyReviews}
              onToggleMyReviews={() => setShowMyReviews(!showMyReviews)}
              onNewReview={() => setIsModalOpen(true)}
            />
          )}
        </Group>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchFilter={searchFilter}
          onFilterChange={setSearchFilter}
        />

        {!currentUser && (
          <Text c="dimmed" ta="center" mt="md">
            Please log in to create reviews and view your personal reviews
          </Text>
        )}

        <Stack gap="md">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                user: { name: review.user.name },
                book: { title: review.book.title }
              }}
            />
          ))}
        </Stack>
      </Stack>

      {currentUser && (
        <ReviewFormModal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          books={books}
          rating={rating}
          onRatingChange={setRating}
          review={review}
          onReviewChange={setReview}
          bookId={bookId}
          onBookIdChange={setBookId}
          error={error}
        />
      )}
    </Container>
  );
}
