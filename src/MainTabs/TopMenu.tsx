import {
  ActionIcon,
  Box,
  Group,
  Menu,
  Paper,
  rem,
  Stack,
  Text,
  useMantineTheme
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconHandStop, IconMenu2, IconPointer, IconBoxMultiple } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import { setActiveTool } from '../Store/SettingsSlice';
import classes from './TopMenu.module.css';

const tools = [
  {
    key: 'pan',
    icon: <IconHandStop
      style={{ width: '50%', height: '50%' }}
      stroke={1}
    />,
    description: 'Click and hold the left mouse button to pan the visualization.'
  },
  {
    key: 'select',
    icon: <IconPointer
      style={{ width: '50%', height: '50%' }}
      stroke={1}
    />,
    description: 'Click and hold the left mouse button to select points.'
  },
  {
    key: 'box',
    icon: <IconBoxMultiple
      style={{ width: '50%', height: '50%' }}
      stroke={1}
    />,
    description: 'Click and hold the left mouse button to create a layout.'
  }
]

export function TopMenu() {
  const activeTool = useAppSelector((state) => state.settings.activeTool)
  const theme = useMantineTheme();
  const dispatch = useAppDispatch();

  useHotkeys(tools.map((tool, i) => {
    return [(i + 1).toString(), () => dispatch(setActiveTool(tool.key))]
  }))

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
          <Menu.Dropdown>
            <Menu.Item>Open saved dataset</Menu.Item>
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
              {
                tools.map((tool, i) => {
                  return <ActionIcon onClick={() => dispatch(setActiveTool(tool.key))} key={tool.key} variant="subtle" size={rem(40)} radius="md" color="dark" bg={activeTool === tool.key ? theme.colors[theme.primaryColor][3] : undefined}>
                    {tool.icon}
                    <Text
                      bottom={8}
                      right={6}
                      size="xs"
                      c="gray"
                      pos="absolute"
                      style={{ transform: 'translateX(50%) translateY(50%)' }}
                    >
                      {i + 1}
                    </Text>
                  </ActionIcon>
                })
              }
            </Group>
          </Paper>
        </Group>
        <Group justify="center">
          <Text size="xs" c="gray">
            {tools.find((e) => e.key === activeTool).description}
          </Text>
        </Group>
      </Stack>

      <Box></Box>
    </Box>
  );
}
