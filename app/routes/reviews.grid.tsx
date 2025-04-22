import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import reviews, { addReview, type Review } from "./reviews";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  TextInput,
  NumberInput,
  Button,
  Stack,
  Group,
  Text,
  Box,
} from "@mantine/core";
import { redirect, type LoaderFunctionArgs } from "react-router";




export default function ReviewsGridPage() {
  const [rowData, setRowData] = useState<Review[]>([...reviews]);

  const [form, setForm] = useState<Omit<Review, "id">>({
    user: "",
    book: "",
    rating: 3,
    review: "",
  });

  const columnDefs = [
    { field: "user", editable: true },
    { field: "book", editable: true },
    { field: "rating", editable: true },
    { field: "review", editable: true },
    {
      field: "actions",
      cellRenderer: (params: any) => (
        <Button color="red" size="xs" onClick={() => handleDelete(params.data.id)}>
          Delete
        </Button>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    deleteReview(id);
    setRowData((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAdd = () => {
    if (!form.user || !form.book || !form.review) return;
    const added = addReview(form);
    setRowData((prev) => [...prev, added]);
    setForm({ user: "", book: "", rating: 3, review: "" });
  };

  return (
    <div>
      <Text size="xl" fw={700} mb="md">
        📄 Manage Reviews
      </Text>

      <Box className="ag-theme-alpine" style={{ height: 400, width: "100%", marginBottom: 20 }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} />
      </Box>

      <Stack maw={600}>
        <Text fw={600}>➕ Add New Review</Text>
        <Group grow>
          <TextInput
            label="User"
            value={form.user}
            onChange={(e) => setForm((f) => ({ ...f, user: e.target.value }))}
          />
          <TextInput
            label="Book"
            value={form.book}
            onChange={(e) => setForm((f) => ({ ...f, book: e.target.value }))}
          />
          <NumberInput
            label="Rating"
            value={form.rating}
            onChange={(value) => setForm((f) => ({ ...f, rating: value || 0 }))}
            min={1}
            max={5}
          />
        </Group>
        <TextInput
          label="Review Text"
          value={form.review}
          onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
        />
        <Button onClick={handleAdd}>Submit</Button>
      </Stack>
    </div>
  );
}