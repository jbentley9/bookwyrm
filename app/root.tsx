/**
 * Root route component.
 * Sets up the base HTML structure, meta tags, and global styles.
 * Handles the root layout and error boundaries.
 */
import '@mantine/core/styles.css';


import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useLoaderData,
} from "react-router";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { useEffect } from "react";
import { getUser } from './utils/auth-user';
import MantineLayout from './components/MantineLayout';
import ReviewsGridLayout from './components/ReviewsGridLayout';

import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return { user };
}

export default function Layout() {
  const { user } = useLoaderData();


  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);


  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineLayout user={user} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function App() {
  return <Layout />;
}

export function HydrateFallback() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>Loading...</h1>
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
