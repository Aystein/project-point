import {
  ActionIcon,
  Box,
  Card,
  Group,
  Indicator,
  Menu,
  Paper,
  rem,
  Stack,
  Text,
} from '@mantine/core';
import classes from './TopMenu.module.css';
import { IconHandStop } from '@tabler/icons-react';
import { IconAdjustments } from '@tabler/icons-react';
import { IconMenu2 } from '@tabler/icons-react';
import { IconPointer } from '@tabler/icons-react';

export function TopMenu() {
  return (
    <Box className={classes.button} style={{ pointerEvents: 'none' }}>
      <Stack>
        <Menu shadow="md" width={200} position="bottom-start">
          <Menu.Target>
            <ActionIcon
              style={{ pointerEvents: 'initial' }}
              variant="default"
              size={rem(40)}
              radius="md"
              color="dark"
            >
              <IconMenu2 style={{ width: '50%', height: '50%' }} stroke={1} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>Open CSV</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>

      <Stack justify="center">
        <Group justify="center">
          <Paper
            shadow="md"
            p={rem(4)}
            radius="md"
            withBorder
            style={{ pointerEvents: 'initial' }}
          >
            <Group gap={rem(4)}>
              <ActionIcon variant="subtle" size={rem(40)} radius="md" color="dark">
                <IconHandStop
                  style={{ width: '50%', height: '50%' }}
                  stroke={1}
                />
                <Text
                  bottom={8}
                  right={6}
                  size="xs"
                  c="gray"
                  pos="absolute"
                  style={{ transform: 'translateX(50%) translateY(50%)' }}
                >
                  1
                </Text>
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size={rem(40)}
                radius="md"
                color="dark"
              >
                <IconPointer
                  style={{ width: '50%', height: '50%' }}
                  stroke={1}
                />
                <Text
                  bottom={8}
                  right={6}
                  size="xs"
                  c="gray"
                  pos="absolute"
                  style={{ transform: 'translateX(50%) translateY(50%)' }}
                >
                  2
                </Text>
              </ActionIcon>
            </Group>
          </Paper>
        </Group>
        <Group justify="center">
          <Text size="xs" c="gray">
            To move the canvas, press the middle mouse button.
          </Text>
        </Group>
      </Stack>

      <Box></Box>
    </Box>
  );
}
