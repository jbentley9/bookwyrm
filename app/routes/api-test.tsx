/**
 * Development tool for testing API endpoints.
 * Provides a simple interface to test various API routes.
 * Includes request/response visualization and error handling.
 */
import { Button, Stack, Text, TextInput, Group, Tabs, NumberInput, Paper, Title, Code, ActionIcon, Tooltip, Loader } from "@mantine/core";
import { useState } from "react";
import { IconTrash, IconCheck, IconX, IconRefresh, IconPlus } from "@tabler/icons-react";
import type { Route } from "./+types/api-test";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "API Test | BookWyrm" },
    { name: "description", content: "Test the BookWyrm API endpoints" },
  ];
}

export default function ApiTest() {
  const [bookId, setBookId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  
  const [reviewId, setReviewId] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState("");
  const [reviewText, setReviewText] = useState("");
  
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setBookId("");
    setTitle("");
    setAuthor("");
    setIsbn("");
    setResponse("");
    setError("");
  };

  const handleResponse = async (response: Response) => {
    const data = await response.json();
    setResponse(JSON.stringify(data, null, 2));
    setError("");
  };

  const handleError = (err: any) => {
    setError(err.message || "An error occurred");
    setResponse("");
  };

  // Books API Tests
  const testGetAllBooks = async () => {
    setResponse("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/books");
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetOneBook = async () => {
    if (!bookId) {
      setError("Please enter a book ID");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}`);
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateBook = async () => {
    if (!title || !author || !isbn) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("isbn", isbn);

      const res = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdateBook = async () => {
    if (!bookId || !title || !author || !isbn) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("isbn", isbn);

      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        body: formData,
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeleteBook = async () => {
    if (!bookId) {
      setError("Please enter a book ID");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reviews API Tests
  const testGetAllReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews");
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetOneReview = async () => {
    if (!reviewId) {
      setError("Please enter a review ID");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`);
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateReview = async () => {
    if (!bookId || !userId || !rating || !reviewText) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("bookId", bookId);
      formData.append("userId", userId);
      formData.append("rating", rating);
      formData.append("review", reviewText);

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdateReview = async () => {
    if (!reviewId || (!rating && !reviewText)) {
      setError("Please fill in at least one field");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (rating) formData.append("rating", rating);
      if (reviewText) formData.append("review", reviewText);

      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        body: formData,
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeleteReview = async () => {
    if (!reviewId) {
      setError("Please enter a review ID");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack p="xl" gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>API Test Page</Title>
        <Group>
          <Tooltip label="Reset Form">
            <ActionIcon
              variant="light"
              color="gray"
              onClick={resetForm}
              size="lg"
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Paper p="xl" withBorder radius="md" shadow="sm">
        <Tabs defaultValue="books">
          <Tabs.List>
            <Tabs.Tab value="books">Books API</Tabs.Tab>
            <Tabs.Tab value="reviews">Reviews API</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="books" pt="xs">
            <Stack>
              <Group>
                <Button
                  variant="light"
                  color="blue"
                  onClick={testGetAllBooks}
                  leftSection={<IconRefresh size={16} />}
                  loading={isLoading}
                >
                  GET All Books
                </Button>
                <Button
                  variant="light"
                  color="blue"
                  onClick={testGetOneBook}
                  leftSection={<IconCheck size={16} />}
                  loading={isLoading}
                >
                  GET One Book
                </Button>
              </Group>

              <Group>
                <TextInput
                  label="Book ID"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  placeholder="Enter book ID"
                />
                <TextInput
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
                <TextInput
                  label="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author"
                />
                <TextInput
                  label="ISBN"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Enter ISBN"
                />
              </Group>

              <Group>
                <Button
                  variant="light"
                  color="green"
                  onClick={testCreateBook}
                  leftSection={<IconPlus size={16} />}
                  loading={isLoading}
                >
                  POST Create Book
                </Button>
                <Button
                  variant="light"
                  color="yellow"
                  onClick={testUpdateBook}
                  leftSection={<IconRefresh size={16} />}
                  loading={isLoading}
                >
                  PUT Update Book
                </Button>
                <Button
                  variant="light"
                  color="red"
                  onClick={testDeleteBook}
                  leftSection={<IconTrash size={16} />}
                  loading={isLoading}
                >
                  DELETE Book
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="reviews" pt="xs">
            <Stack>
              <Group>
                <Button
                  variant="light"
                  color="blue"
                  onClick={testGetAllReviews}
                  leftSection={<IconRefresh size={16} />}
                  loading={isLoading}
                >
                  GET All Reviews
                </Button>
                <Button
                  variant="light"
                  color="blue"
                  onClick={testGetOneReview}
                  leftSection={<IconCheck size={16} />}
                  loading={isLoading}
                >
                  GET One Review
                </Button>
              </Group>

              <Group>
                <TextInput
                  label="Review ID"
                  value={reviewId}
                  onChange={(e) => setReviewId(e.target.value)}
                  placeholder="Enter review ID"
                />
                <TextInput
                  label="Book ID"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  placeholder="Enter book ID"
                />
                <TextInput
                  label="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
                <NumberInput
                  label="Rating"
                  value={rating}
                  onChange={(val) => setRating(val?.toString() || "")}
                  placeholder="Enter rating"
                  min={1}
                  max={5}
                />
                <TextInput
                  label="Review Text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Enter review text"
                  style={{ flex: 1 }}
                />
              </Group>

              <Group>
                <Button
                  variant="light"
                  color="green"
                  onClick={testCreateReview}
                  leftSection={<IconPlus size={16} />}
                  loading={isLoading}
                >
                  POST Create Review
                </Button>
                <Button
                  variant="light"
                  color="yellow"
                  onClick={testUpdateReview}
                  leftSection={<IconRefresh size={16} />}
                  loading={isLoading}
                >
                  PUT Update Review
                </Button>
                <Button
                  variant="light"
                  color="red"
                  onClick={testDeleteReview}
                  leftSection={<IconTrash size={16} />}
                  loading={isLoading}
                >
                  DELETE Review
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {(response || error) && (
        <Paper p="xl" withBorder radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={3}>Response</Title>
              {isLoading && <Loader size="sm" />}
            </Group>
            {error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : (
              <Code block style={{ whiteSpace: "pre-wrap" }}>
                {response}
              </Code>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
} 