import { Title, Text, Button, Group, Stack } from "@mantine/core";
import { IconBook, IconUser } from "@tabler/icons-react";
import { Link } from "react-router";
import type { User } from "@prisma/client";

interface HeroSectionProps {
  currentUser: Pick<User, 'id' | 'name' | 'email'> | null;
}

export function HeroSection({ currentUser }: HeroSectionProps) {
  return (
    <Stack align="center" py="xl" gap="md">
      <Title order={1} size="h1" ta="center">
        Welcome to BookWyrm
      </Title>
      <Text size="xl" ta="center" c="dimmed" maw={580}>
        Discover, review, and share your favorite books with the world. Join our community of book lovers today!
      </Text>
      <Group>
        <Button
          component={Link}
          to="/all-reviews"
          size="lg"
          variant="filled"
          leftSection={<IconBook size={20} />}
        >
          Browse Reviews
        </Button>
        {!currentUser && (
          <Button
            component={Link}
            to="/login"
            size="lg"
            variant="light"
            leftSection={<IconUser size={20} />}
          >
            Sign In
          </Button>
        )}
      </Group>
    </Stack>
  );
} 