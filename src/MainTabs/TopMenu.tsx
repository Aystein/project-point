import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Input,
  Menu,
  Paper,
  rem,
  Slider,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { openContextModal } from '@mantine/modals';
import {
  IconBoxMultiple,
  IconHandStop,
  IconMenu2,
  IconPointer,
  IconRegex,
  IconSettings
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import { ClusteringType, selectByRegex, setClustering, setTool, Tool, Trigger_DBSCAN, updatePositionByFilter } from '../Store/ViewSlice';
import { Engine } from '../ts/engine/engine';
import { getGlobalEngine } from './HistoryTab';
import classes from './TopMenu.module.css';
import { setSettings } from '../Store/SettingsSlice';
import { DBSCAN } from 'density-clustering';
import { VectorLike } from '../Interfaces';
import { useVisContext } from '../WebGL/VisualizationContext';

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

function getCentroid(positions: VectorLike[]) {
  
}

export function SettingsMenu() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const theme = useMantineTheme();
  const rows = useAppSelector((state) => state.data.rows);
  const positions = useAppSelector((state) => state.views.positions);
  const filter = useAppSelector((state) => state.views.filter);
  // 

  const Trigger_DBSCAN = () => {
    const newPositions = [...positions];
    const input = positions.map((value, i) => ([value.x, value.y, i]));

    const clusters = new DBSCAN().run(input, 0.02, 2, (a: number[], b: number[]) => {
      const x = a[0] - b[0];
      const y = a[1] - b[1];

      const ai = a[2];
      const bi = b[2];

      const rowA = rows[ai];
      const rowB = rows[bi];



      return Math.sqrt(x * x + y * y);
    });

    const clustering = clusters.map((cluster: number[]) => {
      let centroid = {
        x: 0,
        y: 0,
      }

      cluster.forEach((index) => {
        centroid.x += positions[index].x;
        centroid.y += positions[index].y;
      })

      centroid.x /= cluster.length;
      centroid.y /= cluster.length;

      cluster.forEach((index) => {
        newPositions[index] = centroid;
      })

      return {
        indices: cluster,
        centroid: centroid,
      }
    }) as ClusteringType

    dispatch(setClustering(clustering))
  }

  return <Menu shadow="md" width={200} position="bottom-start">
    <Menu.Target>
      <ActionIcon
        style={{ pointerEvents: 'initial' }}
        variant="default"
        size={rem(40)}
        radius="md"
        color="dark"
      >
        <IconSettings style={{ width: '50%', height: '50%' }} stroke={1} />
      </ActionIcon>
    </Menu.Target>

    <Menu.Dropdown>
      <Menu.Label>Repulsion Force</Menu.Label>
      <Input.Wrapper label="Radius scaling" description="Determines the relative radius of the marks">
        <Slider
          mt={`calc(${theme.spacing.xs} / 2)`}
          defaultValue={1}
          min={0}
          max={1}
          step={0.01}
          precision={2}
          value={settings.radiusScaling}
          onChange={(newVal) => dispatch(setSettings({ radiusScaling: newVal }))}
        />
      </Input.Wrapper>

      <Menu.Label>Semantic Zooming</Menu.Label>
      <Button
        mt={`calc(${theme.spacing.xs} / 2)`}
        onClick={() => {
          Trigger_DBSCAN()
        }}
      />
    </Menu.Dropdown>
  </Menu>
}

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
      <Group align='start'>
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
              }}
            >
              Debug positions
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <SettingsMenu />
      </Group>

      <Stack justify="center">
        <Group justify="center">
          <Paper
            shadow="md"
            p={rem(4)}
            radius="md"
            withBorder
            style={{ pointerEvents: 'initial' }}
          >
            <Group gap={rem(4)} wrap="nowrap">
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


              <Divider orientation='vertical' mx="xs" my="xs" />

              <ActionIcon
                onClick={() => {
                  const onFinish = (pattern) => {
                    dispatch(selectByRegex({ pattern }))
                  }

                  openContextModal({
                    modal: 'muregex',
                    title: 'Multivariate Regular Expression',
                    innerProps: {
                      onFinish,
                    },
                  });
                }}
                variant="subtle"
                size={rem(40)}
                radius="md"
                color="dark"
              >
                <IconRegex style={{ width: '50%', height: '50%' }} stroke={1} />
              </ActionIcon>
            </Group>

          </Paper>


        </Group>
        <Group justify="center">
          <Text size="xs" c="gray">
            {selection?.length > 0 ? <Text fw="bold" size="xs" c="gray" component='span'>{selection.length}</Text> : 'No'} points selected.{' '}
            {tools.find((e) => e.key === activeTool).description}
          </Text>
        </Group>
      </Stack>

      <Box></Box>
    </Box>
  );
}
