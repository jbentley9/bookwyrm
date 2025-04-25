import { Title, Stack, Grid, Card, Group, Text, Button } from "@mantine/core";
import { IconBook, IconUser } from "@tabler/icons-react";
import { Link } from "react-router";
import type { User } from "@prisma/client";

interface UserFeaturesSectionProps {
  currentUser: Pick<User, 'id' | 'name' | 'email'>;
}

export function UserFeaturesSection({ currentUser }: UserFeaturesSectionProps) {
  return (
    <Stack py="xl" gap="lg">
      <Title order={2}>Your BookWyrm</Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconBook size={24} />
              <Text fw={500}>Your Reviews</Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              View and manage your book reviews
            </Text>
            <Button
              component={Link}
              to="/all-reviews?myReviews=true"
              variant="light"
              fullWidth
            >
              View Your Reviews
            </Button>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconUser size={24} />
              <Text fw={500}>Your Account</Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Manage your account settings
            </Text>
            <Button
              component={Link}
              to="/logout"
              variant="light"
              fullWidth
            >
              Logout
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
} 