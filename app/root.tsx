/**
 * Root route component.
 * Sets up the base HTML structure, meta tags, and global styles.
 * Handles the root layout and error boundaries.
 */
import '@mantine/core/styles.css';

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
import { ColorSchemeScript, mantineHtmlProps, LoadingOverlay, MantineProvider } from "@mantine/core";
import { useEffect, useState } from "react";
import { getUser } from './utils/auth-user';
import MantineLayout from './components/MantineLayout';
import prisma from './db';

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
  const sessionUser = await getUser(request);
  let user = null;

  if (sessionUser) {
    user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { id: true, name: true, email: true, tier: true, isAdmin: true }
    });
  }

  return { user };
}

function AppContent() {
  const { user } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark initial hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Wait for full hydration and interactivity
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;
    const checkReady = () => {
      // Check if the document is fully interactive
      if (document.readyState === 'complete') {
        // Give a small additional delay to ensure React is fully hydrated
        setTimeout(() => setIsLoading(false), 100);
      } else {
        timeoutId = setTimeout(checkReady, 50);
      }
    };

    checkReady();
    return () => clearTimeout(timeoutId);
  }, [isHydrated]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ size: 'xl', color: 'blue' }}
      />
      <MantineLayout user={user} />
    </div>
  );
}

export default function Layout() {
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
        <MantineProvider>
          <AppContent />
        </MantineProvider>
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
