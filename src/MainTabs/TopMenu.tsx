import {
  ActionIcon,
  Box,
  Group,
  Menu,
  Paper,
  rem,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import {
  IconHandStop,
  IconMenu2,
  IconPointer,
  IconBoxMultiple,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import classes from './TopMenu.module.css';
import { Tool, setTool } from '../Store/ViewSlice';
import { getGlobalEngine } from './HistoryTab';
import { Engine } from '../ts/engine/engine';

const tools = [
  {
    key: 'pan' as Tool,
    icon: <IconHandStop style={{ width: '50%', height: '50%' }} stroke={1} />,
    description:
      'Click and hold the left mouse button to pan the visualization.',
  },
  {
    key: 'select' as Tool,
    icon: <IconPointer style={{ width: '50%', height: '50%' }} stroke={1} />,
    description: 'Click and hold the left mouse button to select points.',
  },
  {
    key: 'box' as Tool,
    icon: (
      <IconBoxMultiple style={{ width: '50%', height: '50%' }} stroke={1} />
    ),
    description: 'Click and hold the left mouse button to create a layout.',
  },
];

export function TopMenu() {
  const activeTool = useAppSelector((state) => state.views.selectedTool);
  const theme = useMantineTheme();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.views.selection);
  const positions = useAppSelector((state) => state.views.positions);

  useHotkeys(
    tools.map((tool, i) => {
      return [(i + 1).toString(), () => dispatch(setTool(tool.key))];
    })
  );

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
            <Menu.Item>Open saved dataset</Menu.Item>
            <Menu.Item
              onClick={async () => {
                const buf = await getGlobalEngine().readXY();
                const xy = positions.map((_, i) => {
                  return {
                    x: buf[(Engine.particleStructType.size / 4) * i],
                    y: buf[(Engine.particleStructType.size / 4) * i + 1],
                  };
                });
                console.table(xy);
                console.table(positions);
              }}
            >
              Debug positions
            </Menu.Item>
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
              {tools.map((tool, i) => {
                return (
                  <ActionIcon
                    onClick={() => dispatch(setTool(tool.key))}
                    key={tool.key}
                    variant="subtle"
                    size={rem(40)}
                    radius="md"
                    color="dark"
                    bg={
                      activeTool === tool.key
                        ? theme.colors[theme.primaryColor][3]
                        : undefined
                    }
                  >
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
                );
              })}
            </Group>
          </Paper>
        </Group>
        <Group justify="center">
          <Text size="xs" c="gray">
            {selection?.length} points selected.{' '}
            {tools.find((e) => e.key === activeTool).description}
          </Text>
        </Group>
      </Stack>

      <Box></Box>
    </Box>
  );
}
