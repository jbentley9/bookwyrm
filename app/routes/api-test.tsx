import { Button, Stack, Text, TextInput, Group, Tabs, NumberInput, Paper, Code, Title, Alert, Badge, ActionIcon } from "@mantine/core";
import { useState } from "react";
import { IconInfoCircle, IconX } from '@tabler/icons-react';

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
  const [status, setStatus] = useState<number | null>(null);

  const clearResponse = () => {
    setResponse("");
    setStatus(null);
  };

  // Books API Tests
  const testGetAllBooks = async () => {
    clearResponse();
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testGetOneBook = async () => {
    clearResponse();
    if (!bookId) return;
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testCreateBook = async () => {
    if (!title || !author) return;
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("isbn", isbn);

      const res = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testUpdateBook = async () => {
    if (!bookId || !title || !author) return;
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("isbn", isbn);

      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testDeleteBook = async () => {
    if (!bookId) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  // Reviews API Tests
  const testGetAllReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testGetOneReview = async () => {
    if (!reviewId) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testCreateReview = async () => {
    if (!bookId || !userId || !rating || !reviewText) return;
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
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testUpdateReview = async () => {
    if (!reviewId || (!rating && !reviewText)) return;
    try {
      const formData = new FormData();
      if (rating) formData.append("rating", rating);
      if (reviewText) formData.append("review", reviewText);

      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testDeleteReview = async () => {
    if (!reviewId) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.status);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <Stack p="md" gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>API Test Page</Title>
        <Badge size="lg" variant="light" color="blue">Development Tools</Badge>
      </Group>

      <Alert 
        icon={<IconInfoCircle size="1rem" />} 
        title="API Testing Tool" 
        color="blue" 
        variant="light"
      >
        This page allows you to test all available API endpoints. The API is implemented using RESTful principles and supports CRUD operations for both books and reviews.
      </Alert>

      <Tabs defaultValue="books">
        <Tabs.List>
          <Tabs.Tab value="books">Books API</Tabs.Tab>
          <Tabs.Tab value="reviews">Reviews API</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="books" pt="xs">
          <Stack gap="md">
            <Group>
              <Button onClick={testGetAllBooks} variant="light">GET /api/books</Button>
              <Button onClick={testGetOneBook} variant="light">GET /api/books/:id</Button>
            </Group>

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text size="sm" fw={500}>Book Data</Text>
                <Group grow>
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
                  <Button onClick={testCreateBook} color="green">POST /api/books</Button>
                  <Button onClick={testUpdateBook} color="blue">PUT /api/books/:id</Button>
                  <Button onClick={testDeleteBook} color="red">DELETE /api/books/:id</Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          <Stack gap="md">
            <Group>
              <Button onClick={testGetAllReviews} variant="light">GET /api/reviews</Button>
              <Button onClick={testGetOneReview} variant="light">GET /api/reviews/:id</Button>
            </Group>

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text size="sm" fw={500}>Review Data</Text>
                <Group grow>
                  <TextInput
                    label="Review ID"
                    value={reviewId}
                    onChange={(e) => setReviewId(e.target.value)}
                    placeholder="Enter review ID"
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
                    onChange={(value) => setRating(value?.toString() || "")}
                    placeholder="Enter rating (1-5)"
                    min={1}
                    max={5}
                  />
                </Group>
                <TextInput
                  label="Review Text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Enter review text"
                />
                <Group>
                  <Button onClick={testCreateReview} color="green">POST /api/reviews</Button>
                  <Button onClick={testUpdateReview} color="blue">PUT /api/reviews/:id</Button>
                  <Button onClick={testDeleteReview} color="red">DELETE /api/reviews/:id</Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {response && (
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Group>
                <Text size="sm" fw={500}>Response</Text>
                {status && (
                  <Badge color={status >= 200 && status < 300 ? "green" : "red"}>
                    Status: {status}
                  </Badge>
                )}
              </Group>
              <ActionIcon 
                variant="light" 
                color="gray" 
                onClick={clearResponse}
                title="Clear response"
              >
                <IconX size="1rem" />
              </ActionIcon>
            </Group>
            <Code block style={{ whiteSpace: 'pre-wrap' }}>
              {response}
            </Code>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
} 