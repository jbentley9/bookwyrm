import { getSession, destroySession } from "../sessions.server";
import type { Route } from "./+types/logout";
import { Form, Link, redirect } from "react-router";
import { Button, Group, Stack, Text, Paper, Container } from "@mantine/core";
import { getUser } from "../utils/auth-user";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUser(request);
    if (!user) {
        return redirect("/login");
    }
    return null;
}

export async function action({
    request,
  }: Route.ActionArgs) {
    const session = await getSession(
      request.headers.get("Cookie")
    );
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  
export default function LogoutRoute() {
    return (
      <Container size="xs" py="xl">
        <Paper 
          shadow="sm" 
          p="xl" 
          radius="md"
          withBorder
          style={{
            background: 'white',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          <Stack gap="lg">
            <Text size="lg" fw={500} ta="center">
              Are you sure you want to log out?
            </Text>
            <Group justify="center" gap="md">
              <Form method="post">
                <Button 
                  type="submit"
                  color="red"
                  variant="filled"
                  size="md"
                >
                  Logout
                </Button>
              </Form>
              <Button 
                component={Link} 
                to="/"
                variant="default"
                size="md"
              >
                Never mind
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }