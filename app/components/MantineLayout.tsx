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
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from "react-router";
import { IconHome, IconBook, IconUser, IconUsers, IconChevronDown, IconChevronRight, IconMessage, IconLogout, IconApi, IconCode } from '@tabler/icons-react';

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

  return (
    <MantineProvider theme={theme}>
      <AppShell
        layout="alt"
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding={0}
      >
        <AppShellNavbar p="md">
          <Stack h="100%" justify="space-between">
            <Stack gap="xl">
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
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(21, 170, 191, 0.1) 100%)',
                    border: '1px solid rgba(34, 139, 230, 0.1)',
                  }}>
                    <Group>
                      <Avatar color="blue" radius="xl">
                        <IconUser size="1.5rem" />
                      </Avatar>
                      <div>
                        <Text size="sm" c="dimmed">Welcome back,</Text>
                        <Text fw={500}>{user.name}</Text>
                      </div>
                    </Group>
                  </Box>
                )}
              </Box>

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