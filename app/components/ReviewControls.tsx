import { Group, Button } from "@mantine/core";
import { IconPlus, IconUser } from "@tabler/icons-react";

interface ReviewControlsProps {
  showMyReviews: boolean;
  onToggleMyReviews: () => void;
  onNewReview: () => void;
}

export function ReviewControls({
  showMyReviews,
  onToggleMyReviews,
  onNewReview
}: ReviewControlsProps) {
  return (
    <Group>
      <Button
        variant={showMyReviews ? "filled" : "default"}
        onClick={onToggleMyReviews}
        leftSection={<IconUser size={16} />}
      >
        {showMyReviews ? "All Reviews" : "My Reviews"}
      </Button>
      <Button
        variant="filled"
        onClick={onNewReview}
        leftSection={<IconPlus size={16} />}
      >
        New Review
      </Button>
    </Group>
  );
} 