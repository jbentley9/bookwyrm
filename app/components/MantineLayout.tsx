import {
  AppShell,
  MantineProvider,
  AppShellNavbar,
  AppShellMain,
  NavLink,
  Button,
  Group,
  Stack,
  Title,
  createTheme,
  UnstyledButton,
  Text,
  Avatar,
} from "@mantine/core";
import { Link } from "react-router";
import { IconHome, IconBook, IconUser } from '@tabler/icons-react';
import { Outlet } from "react-router";

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

interface MantineLayoutProps {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function MantineLayout({ user }: MantineLayoutProps) {
  return (
    <MantineProvider theme={theme}>
      <AppShell
        layout="alt"
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding={0}
      >
        <AppShellNavbar p="md" style={{ 
          background: 'white', 
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>   
          <AppShell.Section>
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
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(34, 139, 230, 0.1)',
              display: user ? "block" : "none"
            }}>
              <Group>
                <Avatar color="blue" radius="xl">
                  <IconUser size="1.5rem" />
                </Avatar>
                <div>
                  <Text size="sm" c="dimmed">Welcome back,</Text>
                  <Text fw={500}>{user?.name}</Text>
                </div>
              </Group>
            </div>
          </AppShell.Section>
          <AppShell.Section grow>
            <Stack gap={4}>
              <NavLink
                component={Link}
                to="/"
                label="Home"
                leftSection={<IconHome size="1.2rem" stroke={1.5} />}
                style={{ padding: '12px 16px' }}
              />
              <NavLink
                component={Link}
                to="/all-reviews"
                label="Reviews"
                leftSection={<IconBook size="1.2rem" stroke={1.5} />}
                style={{ padding: '12px 16px' }}
              />
            </Stack>
          </AppShell.Section>
          <AppShell.Section style={{ display: user ? "block" : "none"}}>
            <Title order={5} ta="center"> - Admin - </Title>
            <Stack gap={4}>
              <NavLink
                component={Link}
                to="/reviews-grid"
                label="Manage Reviews"
                leftSection={<IconBook size="1.2rem" stroke={1.5} />}
                style={{ padding: '12px 16px' }}
              />
            </Stack>
          </AppShell.Section>
          <AppShell.Section>
            <Button component={Link} to={user ? "/logout" : "/login"} fullWidth>{user ? "Logout" : "Login"}</Button>
          </AppShell.Section>
        </AppShellNavbar>
        <AppShellMain>
          <Outlet />
        </AppShellMain>
      </AppShell>
    </MantineProvider>
  );
} 