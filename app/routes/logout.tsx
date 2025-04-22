import { getSession, destroySession } from "../sessions.server";
import type { Route } from "./+types/logout";
import { Form, Link, redirect } from "react-router";
import { Button, Group } from "@mantine/core";
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
      <>
        <p>Are you sure you want to log out?</p>
        <Group>
        <Form method="post">
          <Button type="submit">Logout</Button>
        </Form>
        <Button component={Link} to="/">Never mind</Button>
        </Group>
      </>
    );
  }