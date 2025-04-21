// app/routes/test.tsx
import { Button, TextInput } from "@mantine/core";

export default function TestPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Test Mantine</h1>
      <TextInput label="Your name" placeholder="e.g. BookWyrm" />
      <Button mt="md">Click me</Button>
    </div>
  );
}