import '@mantine/core/styles.css';
import type { Route } from "./+types/login";
import prisma from "../db";
import { Container, Title, Text, TextInput, PasswordInput, Button, Stack, Paper, Group } from "@mantine/core";
import { useNavigate, useSubmit } from "react-router";
import { useState } from "react";
//import { notifications } from '@mantine/notifications';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // For now, we'll just check if the password matches - would be a hash in a real app
    if (user.password !== password) {
      return { error: "Invalid email or password" };
    }

    // Create a token here
    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login" };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    submit(formData, { method: "post" });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Text
          component="a"
          href="#"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            navigate("/register");
          }}
          style={{ cursor: 'pointer' }}
        >
          Create account
        </Text>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              name="email"
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              name="password"
              required
            />
            <Group justify="space-between" mt="lg">
              <Text
                component="a"
                href="#"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  // Add forgot password functionality
                }}
                style={{ cursor: 'pointer' }}
              >
                Forgot password?
              </Text>
            </Group>
            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
