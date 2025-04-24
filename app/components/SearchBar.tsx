import { TextInput, ActionIcon, Menu, Group } from "@mantine/core";
import { IconFilter, IconX } from "@tabler/icons-react";
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from "react";

type SearchFilter = 'all' | 'book' | 'review' | 'user';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchFilter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
}

export function SearchBar({ 
  searchTerm, 
  onSearchChange, 
  searchFilter, 
  onFilterChange 
}: SearchBarProps) {
  const [debouncedSearch] = useDebouncedValue(searchTerm, 200);

  return (
    <Group style={{ width: '100%' }} gap="xs">
      <TextInput
        placeholder="Search reviews..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: 1 }}
        rightSection={
          searchTerm && (
            <ActionIcon
              variant="transparent"
              onClick={() => onSearchChange("")}
            >
              <IconX size={16} />
            </ActionIcon>
          )
        }
      />
      <Menu position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="light" size="lg">
            <IconFilter size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Search in</Menu.Label>
          <Menu.Item
            onClick={() => onFilterChange('all')}
            leftSection={searchFilter === 'all' ? '✓' : ''}
          >
            All fields
          </Menu.Item>
          <Menu.Item
            onClick={() => onFilterChange('book')}
            leftSection={searchFilter === 'book' ? '✓' : ''}
          >
            Book titles
          </Menu.Item>
          <Menu.Item
            onClick={() => onFilterChange('review')}
            leftSection={searchFilter === 'review' ? '✓' : ''}
          >
            Review content
          </Menu.Item>
          <Menu.Item
            onClick={() => onFilterChange('user')}
            leftSection={searchFilter === 'user' ? '✓' : ''}
          >
            User names
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
} 