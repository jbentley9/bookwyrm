import {
  AppShellNavbar,
  AppShell,
  NavLink,
  Button,
  Group,
  Stack,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Link } from "react-router";
import { IconHome, IconBook } from '@tabler/icons-react';
import { Outlet } from "react-router";

interface ReviewsGridLayoutProps {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function ReviewsGridLayout({ user }: ReviewsGridLayoutProps) {
  return (
    <div style={{ display: 'flex' }}>
      <AppShellNavbar p="md" style={{ 
        background: 'white', 
        position: 'fixed',
        height: '100vh',
        top: 0,
        left: 0,
        width: 280,
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
          <Title order={4} display={user ? "block" : "none"}>Hi, {user?.name}</Title>
        </AppShell.Section>
        <AppShell.Section>
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
        <AppShell.Section style={{ position: 'absolute', bottom: 10}}>
          <Button component={Link} to={user ? "/logout" : "/login"}>{user ? "Logout" : "Login"}</Button>
        </AppShell.Section>
      </AppShellNavbar>
      <div style={{ marginLeft: 280, width: 'calc(100% - 280px)' }}>
        <Outlet />
      </div>
    </div>
  );
} 