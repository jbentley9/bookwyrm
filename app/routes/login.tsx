import '@mantine/core/styles.css';
import type { Route } from "./+types/login";
import { Container, Title, Text, TextInput, PasswordInput, Button, Stack, Paper, Group, Center, Box } from "@mantine/core";
import { data, redirect, useNavigate, useActionData, Form } from "react-router";
import { useState } from "react";
import { authenticateUser } from "../utils/auth";
import { getSession, commitSession } from "../sessions.server";
import { IconBook, IconArrowRight } from "@tabler/icons-react";

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
  
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
  const actionData = useActionData<typeof action>();

  return (
    <Container size={460} mb={40}>
      <Stack align="center" gap="md">
        <Center>
          <IconBook size={50} style={{ color: 'var(--mantine-color-blue-6)' }} />
        </Center>
        <Title ta="center" fw={900} size="h2">
          Welcome to BookWyrm
        </Title>
        <Text c="dimmed" size="sm" ta="center" maw={340}>
          Sign in to your account to access your reviews and join our community of book lovers.
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Form 
          method="post"
          onSubmit={() => setLoading(true)}
        >
          <Stack gap="md">
            {actionData?.error && (
              <Text c="red" size="sm" ta="center" style={{ backgroundColor: 'var(--mantine-color-red-0)', padding: '8px', borderRadius: '4px' }}>
                {actionData.error}
              </Text>
            )}
            <TextInput
              label="Email"
              placeholder="you@example.com"
              name="email"
              required
              radius="md"
              size="md"
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--mantine-color-blue-6)',
                  },
                },
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              name="password"
              required
              radius="md"
              size="md"
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--mantine-color-blue-6)',
                  },
                },
              }}
            />
            <Group justify="space-between" mt="xs">
              <Text
                component="a"
                href="#"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
                style={{ cursor: 'pointer' }}
                c="blue"
              >
                Create account
              </Text>
              <Text
                component="a"
                href="#"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  // Add forgot password functionality
                }}
                style={{ cursor: 'pointer' }}
                c="blue"
              >
                Forgot password?
              </Text>
            </Group>
            <Button 
              type="submit" 
              fullWidth 
              size="md"
              loading={loading}
              radius="md"
              rightSection={!loading && <IconArrowRight size={16} />}
            >
              Sign in
            </Button>
          </Stack>
        </Form>
      </Paper>
    </Container>
  );
}
