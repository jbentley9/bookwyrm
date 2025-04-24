import '@mantine/core/styles.css';
//import '@mantine/notifications/styles.css';
import type { Route } from "./+types/login";
import { Container, Title, Text, TextInput, PasswordInput, Button, Stack, Paper, Group, Center, Box, Tabs, rem } from "@mantine/core";
import { data, redirect, useNavigate, useActionData, Form } from "react-router";
import { useState } from "react";
import { authenticateUser } from "../utils/auth";
import { getSession, commitSession } from "../sessions.server";
import { IconBook, IconArrowRight, IconUserPlus } from "@tabler/icons-react";
import prisma from "../db";
//import { notifications } from "@mantine/notifications";

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
  const actionType = formData.get('actionType') as string;
  
  if (actionType === 'login') {
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
  } else if (actionType === 'register') {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In a real app, you should hash the password
        tier: 'BASIC', // Default tier
        isAdmin: false // Default to non-admin
      }
    });

    // Store user in server session
    session.set('user', newUser);

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    });
  }

  return { error: "Invalid action" };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | BookWyrm" },
    { name: "description", content: "Login to your BookWyrm account or create a new one to start sharing your book reviews." },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('login');
  const actionData = useActionData<typeof action>();

  const showForgotPasswordMessage = () => {
    alert('This feature is currently under development. Please contact an administrator for assistance.');
  };

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
          {activeTab === 'login' 
            ? "Sign in to your account to access your reviews and join our community of book lovers."
            : "Create a new account to start sharing your book reviews with our community."}
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="login" leftSection={<IconArrowRight size={16} />}>
              Sign in
            </Tabs.Tab>
            <Tabs.Tab value="register" leftSection={<IconUserPlus size={16} />}>
              Create account
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pt="md">
            <Form 
              method="post"
              onSubmit={() => setLoading(true)}
            >
              <input type="hidden" name="actionType" value="login" />
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
                <Text
                  component="a"
                  href="#"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    showForgotPasswordMessage();
                  }}
                  style={{ cursor: 'pointer' }}
                  c="blue"
                >
                  Forgot password?
                </Text>
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
          </Tabs.Panel>

          <Tabs.Panel value="register" pt="md">
            <Form 
              method="post"
              onSubmit={() => setLoading(true)}
            >
              <input type="hidden" name="actionType" value="register" />
              <Stack gap="md">
                {actionData?.error && (
                  <Text c="red" size="sm" ta="center" style={{ backgroundColor: 'var(--mantine-color-red-0)', padding: '8px', borderRadius: '4px' }}>
                    {actionData.error}
                  </Text>
                )}
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  name="name"
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
                <Button 
                  type="submit" 
                  fullWidth 
                  size="md"
                  loading={loading}
                  radius="md"
                  rightSection={!loading && <IconUserPlus size={16} />}
                >
                  Create account
                </Button>
              </Stack>
            </Form>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}
