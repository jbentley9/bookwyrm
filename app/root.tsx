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
  useRouteError,
} from "react-router";
import { ColorSchemeScript, mantineHtmlProps, LoadingOverlay, MantineProvider, Alert, Stack, Button, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { getUser } from './utils/auth-user';
import MantineLayout from './components/MantineLayout';
import prisma from './db';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

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

function ErrorDisplay() {
  const error = useRouteError();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again later.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you're looking for doesn't exist.";
    } else {
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <MantineProvider>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--mantine-color-body)'
      }}>
        <Stack w={400} gap="md" p="xl">
          <Alert
            variant="filled"
            color="red"
            title={title}
            icon={<IconAlertCircle size={24} />}
          >
            <Text size="sm" mb="md">{message}</Text>
            {isClient && (
              <Button
                variant="white"
                onClick={() => window.location.reload()}
                leftSection={<IconRefresh size={16} />}
                fullWidth
              >
                Try Again
              </Button>
            )}
          </Alert>
        </Stack>
      </div>
    </MantineProvider>
  );
}

function AppContent() {
  const { user } = useLoaderData();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mark initial hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Wait for full hydration and interactivity
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;
    const checkReady = () => {
      try {
        // Check if the document is fully interactive
        if (document.readyState === 'complete') {
          // Give a small additional delay to ensure React is fully hydrated
          setTimeout(() => setIsLoading(false), 100);
        } else {
          timeoutId = setTimeout(checkReady, 50);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize application'));
      }
    };

    checkReady();
    return () => clearTimeout(timeoutId);
  }, [isHydrated]);

  if (error) {
    return (
      <Alert
        variant="filled"
        color="red"
        title="Failed to Load"
        icon={<IconAlertCircle size={24} />}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '400px',
          width: '90%',
          zIndex: 1000
        }}
      >
        <Text size="sm" mb="md">
          {error.message}
        </Text>
        <Button
          variant="white"
          onClick={() => window.location.reload()}
          leftSection={<IconRefresh size={16} />}
          fullWidth
        >
          Try Again
        </Button>
      </Alert>
    );
  }

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

export function ErrorBoundary() {
  return <ErrorDisplay />;
}
