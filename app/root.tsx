import '@mantine/core/styles.css';
//import { Notifications } from '@mantine/notifications';

import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
} from "react-router";
import {
  AppShell,
  MantineProvider,
  AppShellNavbar,
  AppShellMain,
  NavLink,
  Group,
  Text,
  Stack,
  Title,
  createTheme,
  rem,
  UnstyledButton,
  Box, ColorSchemeScript, mantineHtmlProps
} from "@mantine/core";
import { IconHome, IconBook } from '@tabler/icons-react';

import type { Route } from "./+types/root";

const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'Inter, sans-serif',
  components: {
    AppShell: {
      styles: {
        main: {
          background: '#f8f9fa',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(34, 139, 230, 0.1)',
            transform: 'translateX(4px)',
          },
          '&[dataActive]': {
            background: 'rgba(34, 139, 230, 0.15)',
            color: '#228be6',
            fontWeight: 600,
            transform: 'translateX(4px)',
            '& .mantine-NavLink-label': {
              fontWeight: 600,
              color: '#228be6',
            },
            '& .mantine-NavLink-icon': {
              color: '#228be6',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: '#228be6',
              borderRadius: '4px 0 0 4px',
            },
          },
        },
      },
    },
  },
});

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

export default function Layout() {
  const location = useLocation().pathname;
  //console.log(location);

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
    <MantineProvider theme={theme}>
      {/* <Notifications position="bottom-left" /> */}
      <AppShell
        layout="alt"
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding={0}
      >
        <AppShellNavbar p="md" style={{ 
          background: 'white', 
          //borderRight: '1px solid #e9ecef',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
        }}>
          <Box style={{ position: 'sticky', top: 0 }}>
            <Stack gap="xl">
              <UnstyledButton component={Link} to="/">
                <Group>
                  <Title order={2} style={{ 
                    color: '#228be6',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(45deg, #228be6, #15aabf)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    BookWyrm
                  </Title>
                </Group>
              </UnstyledButton>
              <Stack gap={4}>
                <NavLink
                  component={Link}
                  to="/"
                  label="Home"
                  leftSection={<IconHome size="1.2rem" stroke={1.5} />}
                  style={{ padding: '12px 16px' }}
                  active={location === '/'}
                />
                <NavLink
                  component={Link}
                  to="/reviews"
                  label="Reviews"
                  leftSection={<IconBook size="1.2rem" stroke={1.5} />}
                  style={{ padding: '12px 16px' }}
                  active={location === '/reviews'}
                />
              </Stack>
            </Stack>
          </Box>
        </AppShellNavbar>
        <AppShellMain style={{ 
          padding: '32px',
          marginLeft: '280px',
          minHeight: '100vh',
        }}>
          <Box style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <ScrollRestoration />
            <Outlet />
          </Box>
        </AppShellMain>
      </AppShell>
    </MantineProvider>
    </body>
    </html>
  );
}

export function App() {
  return (
    <Layout />
      
  );
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
