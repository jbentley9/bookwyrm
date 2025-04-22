import '@mantine/core/styles.css';
import type { Route } from "./+types/login";
import { Container, Title, Text, TextInput, PasswordInput, Button, Stack, Paper, Group } from "@mantine/core";
import { data, redirect, useNavigate } from "react-router";
import { useState } from "react";
import { authenticateUser } from "../utils/auth";
import { getSession, commitSession } from "../sessions.server";

// Loader function to get the user from the cookie
export async function loader({
    request,
  }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.data.user;
    if (user) {
        return redirect("/");
    }
    return data(
        {error: session.get("error"),}, 
        { headers: 
            { "Set-Cookie": await commitSession(session)} }
    );
  }

// Action function to handle the login form submission
export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  
  let email: string;
  let password: string;

  const contentType = request.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    const data = await request.json();
    email = data.email;
    password = data.password;
  } else {
    const formData = await request.formData();
    email = formData.get('email') as string;
    password = formData.get('password') as string;
  }

  const user = await authenticateUser(email, password);
  
  if (!user) {
    return { error: "Invalid email or password" };
  }

  // Store user in server session
  session.set('user', user);

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  });
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Store user in sessionStorage on successful login
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} method="post">
          <Stack>
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
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
