import '@mantine/core/styles.css';
import type { Route } from "./+types/login";
import { Container, Title, Text, TextInput, PasswordInput, Button, Stack, Paper, Group } from "@mantine/core";
import { data, redirect, useNavigate } from "react-router";
import { useState } from "react";
import { authenticateUser } from "../utils/auth";
import { userCookie } from "../utils/auth-cookie";


export async function loader({
    request,
  }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await userCookie.parse(cookieHeader)) || {};
    return data({ User: cookie.user });
  }


export async function action({ request }: Route.ActionArgs) {
  //console.log("Login action called");
  
  let email: string;
  let password: string;

  // Check content type to determine how to parse the data
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
  
  //console.log("Request data:", { email, password });

  const user = await authenticateUser(email, password);
  //console.log("Authentication result:", user);
  
  if (!user) {
    return { error: "Invalid email or password" };
  }



  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await userCookie.parse(cookieHeader)) || {};
  cookie.user = user;
  const newCookieHeader = await userCookie.serialize(cookie);

  return redirect('/', { headers: { 'Set-Cookie': newCookieHeader } });

  //console.log("User stored in session");
  
  return { user };
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //console.log("handleSubmit called");
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    //console.log("Form data before submission:", { email, password });
    
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      //console.log("Response received:", response);
      const data = await response.json();
      //console.log("Response data:", data);
      
      if (data.error) {
        setError(data.error);
      } else {
        // Store user in session
        //sessionStorage.setItem('user', JSON.stringify(data.user));
        //console.log("User stored in session from response");
        navigate('/');
      }
    } catch (err) {
      //console.error("Login error:", err);
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
