import { Button, Stack, Text, TextInput, Group, Tabs, NumberInput } from "@mantine/core";
import { useState } from "react";

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

  // Books API Tests
  const testGetAllBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testGetOneBook = async () => {
    if (!bookId) return;
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
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
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <Stack p="md">
      <Text size="xl" fw={700}>API Test Page</Text>
      
      <Tabs defaultValue="books">
        <Tabs.List>
          <Tabs.Tab value="books">Books API</Tabs.Tab>
          <Tabs.Tab value="reviews">Reviews API</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="books" pt="xs">
          <Stack>
            <Group>
              <Button onClick={testGetAllBooks}>Test GET All Books</Button>
              <Button onClick={testGetOneBook}>Test GET One Book</Button>
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
              <Button onClick={testCreateBook}>Test Create Book</Button>
              <Button onClick={testUpdateBook}>Test Update Book</Button>
              <Button onClick={testDeleteBook}>Test Delete Book</Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          <Stack>
            <Group>
              <Button onClick={testGetAllReviews}>Test GET All Reviews</Button>
              <Button onClick={testGetOneReview}>Test GET One Review</Button>
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
              <Button onClick={testCreateReview}>Test Create Review</Button>
              <Button onClick={testUpdateReview}>Test Update Review</Button>
              <Button onClick={testDeleteReview}>Test Delete Review</Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Text size="sm" fw={500}>Response:</Text>
      <pre style={{ 
        backgroundColor: "#f5f5f5", 
        padding: "1rem", 
        borderRadius: "4px",
        overflow: "auto",
        maxHeight: "300px"
      }}>
        {response || "No response yet"}
      </pre>
    </Stack>
  );
} 