/**
 * The main layout component that wraps the entire application.
 * Handles the navigation sidebar, user authentication state, and routing.
 * Uses Mantine's AppShell for the base layout structure with a responsive navbar.
 * 
 * The layout includes:
 * - BookWyrm logo and branding
 * - User profile section (when logged in)
 * - Main navigation links (Home, All Reviews)
 * - Admin section (Reviews, Books, Users management)
 * - Development tools section (API Test)
 * - Login/Logout button
 */
import {
  AppShell,
  MantineProvider,
  AppShellNavbar,
  AppShellMain,
  NavLink,
  createTheme,
  UnstyledButton,
  Group,
  Button,
  Stack,
  Title,
  Text,
  Avatar,
  Collapse,
  Divider,
  Box,
  Badge,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from "react-router";
import { IconHome, IconBook, IconUser, IconUsers, IconChevronDown, IconChevronRight, IconMessage, IconLogout, IconApi, IconCode, IconCrown } from '@tabler/icons-react';

// Custom theme configuration for the entire app
// Uses a blue primary color with Inter font family
// Customizes AppShell and NavLink components with specific styles
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
        navbar: {
          background: 'linear-gradient(180deg, rgba(34, 139, 230, 0.05) 0%, rgba(34, 139, 230, 0.02) 100%)',
          borderRight: '1px solid rgba(34, 139, 230, 0.1)',
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
            background: 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(21, 170, 191, 0.1) 100%) !important',
            transform: 'translateX(4px)',
            '& .mantine-NavLink-body': {
              background: 'transparent !important',
            },
          },
          '&[dataActive]': {
            background: 'linear-gradient(135deg, rgba(34, 139, 230, 0.2) 0%, rgba(21, 170, 191, 0.2) 100%)',
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

// Props interface for the layout component
// Expects a user object with basic profile info and admin status
interface MantineLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    tier?: string;
    isAdmin: boolean;
  } | null;
}

export default function MantineLayout({ user }: MantineLayoutProps) {
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <MantineProvider theme={theme}>
      <AppShell
        layout="alt"
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding={0}
      >
        {/* Left sidebar navigation */}
        <AppShellNavbar p="md">
          <Stack h="100%" justify="space-between">
            <Stack gap="xl">
              {/* Logo and branding section */}
              <Box>
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
                {user && (
                  <Box mt="md" p="md" style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    border: '1px solid rgba(34, 139, 230, 0.15)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}>
                    <Group wrap="nowrap">
                      <Avatar 
                        color="blue" 
                        radius="xl"
                        size="lg"
                        style={{
                          border: '2px solid rgba(34, 139, 230, 0.2)',
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" mb={2}>Welcome,</Text>
                        <Group gap="xs" wrap="nowrap" align="center">
                          <Text fw={600} size="sm" style={{ lineHeight: 1.2 }}>{user.name}</Text>
                          {user.tier === 'PREMIER' && (
                            <IconCrown 
                              size={16} 
                              style={{ 
                                color: '#fab005',
                                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                              }} 
                            />
                          )}
                        </Group>
                        {user.isAdmin && (
                          <Badge 
                            variant="light" 
                            color="blue"
                            size="xs"
                            mt={4}
                            style={{ 
                              textTransform: 'none',
                              letterSpacing: '0.3px',
                              background: 'rgba(34, 139, 230, 0.1)',
                              border: '1px solid rgba(34, 139, 230, 0.2)',
                            }}
                          >
                            Admin
                          </Badge>
                        )}
                      </div>
                    </Group>
                  </Box>
                )}
              </Box>

              {/* Main navigation links - visible to all users */}
              <Stack gap="xs">
                <NavLink
                  component={Link}
                  to="/"
                  label="Home"
                  leftSection={<IconHome size="1.2rem" stroke={1.5} />}
                  style={{ padding: '12px 16px' }}
                  active={location.pathname === '/'}
                />
                <NavLink
                  component={Link}
                  to="/all-reviews"
                  label="All Reviews"
                  leftSection={<IconMessage size="1.2rem" stroke={1.5} />}
                  style={{ padding: '12px 16px' }}
                  active={location.pathname === '/all-reviews'}
                />
              </Stack>

              {/* Admin section - only visible to admin users */}
              {user && user.isAdmin && (
                <>
                  <Divider my="xs" />
                  <Box>
                    <Text size="sm" c="dimmed" fw={500} pl="md" mb="xs">Manage</Text>
                    <Stack gap={4}>
                      <NavLink
                        component={Link}
                        to="/reviews-grid"
                        label="Reviews"
                        leftSection={<IconMessage size="1.2rem" stroke={1.5} />}
                        style={{ padding: '12px 16px' }}
                        active={location.pathname === '/reviews-grid'}
                      />
                      <NavLink
                        component={Link}
                        to="/books-grid"
                        label="Books"
                        leftSection={<IconBook size="1.2rem" stroke={1.5} />}
                        style={{ padding: '12px 16px' }}
                        active={location.pathname === '/books-grid'}
                      />
                      <NavLink
                        component={Link}
                        to="/users-grid"
                        label="Users"
                        leftSection={<IconUsers size="1.2rem" stroke={1.5} />}
                        style={{ padding: '12px 16px' }}
                        active={location.pathname === '/users-grid'}
                      />
                    </Stack>
                  </Box>
                </>
              )}

              {/* Development tools section - visible to logged in users */}
              {user && (
                <>
                  <Divider my="xs" />
                  <Box>
                    <Text size="sm" c="dimmed" fw={500} pl="md" mb="xs">Development</Text>
                    <Stack gap={4}>
                      <NavLink
                        component={Link}
                        to="/api-test"
                        label="API Test"
                        leftSection={<IconApi size="1.2rem" stroke={1.5} />}
                        style={{ padding: '12px 16px' }}
                        active={location.pathname === '/api-test'}
                      />
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>

            {/* Bottom section with login/logout button */}
            <Box>
              <Divider mb="md" />
              <Button 
                component={Link} 
                to={user ? "/logout" : "/login"} 
                fullWidth
                variant="light"
                color={user ? "red" : "blue"}
                leftSection={<IconLogout size="1.2rem" stroke={1.5} />}
              >
                {user ? "Logout" : "Login"}
              </Button>
            </Box>
          </Stack>
        </AppShellNavbar>
        <AppShellMain>
          <Outlet />
        </AppShellMain>
      </AppShell>
    </MantineProvider>
  );
} 