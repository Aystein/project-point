import {
  Box,
  CheckIcon,
  ColorSwatch,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { useDispatch } from 'react-redux';
import { selectActiveModel, selectChannelTypes, selectConfigByChannel } from '../Store/Selectors';
import { useAppSelector } from '../Store/hooks';
import classes from './SideMenu.module.css';
import { ColorConfiguration } from '../Store/interfaces';

export function ColorLegend() {
  const model = useAppSelector(selectActiveModel);
  const config = useAppSelector(selectConfigByChannel('color')) as ColorConfiguration;

  return (
    <ScrollArea.Autosize mah={400}>
      <Box p="xs">
        <Text truncate="end" maw="calc(16rem - 40px)"><Text fw={500} component='span'>Color</Text> by {config.column}</Text>
        <Stack gap="xs" mt="sm">
          {model.colorFilter.map((value) => {
            return (
              <Group key={value.column}>
                <ColorSwatch
                  component="button"
                  // onClick={() => setChecked((c) => !c)}
                  style={{ color: '#fff', cursor: 'pointer' }}
                  color={value.color}
                  size={rem(20)}
                >
                  {value.active && (
                    <CheckIcon style={{ width: rem(12), height: rem(12) }} />
                  )}
                </ColorSwatch>
                <Text lh={1}>{value.column}</Text>
              </Group>
            );
          })}
        </Stack>
      </Box>
    </ScrollArea.Autosize>
  );
}

export function Legends() {
  const activeModel = useAppSelector(selectActiveModel);
  const layoutConfigurations = useAppSelector(
    (state) =>
      state.views.models.entities[state.views.activeModel]?.layoutConfigurations
        .entities
  );

  const usedChannels = useAppSelector(selectChannelTypes);
  const dispatch = useDispatch();

  return activeModel && activeModel.colorFilter ? (
    <Paper
      className={classes.legends}
      withBorder
      radius="md"
      shadow="md"
      p="xs"
      key={activeModel.id}
    >
      <ColorLegend />
    </Paper>
  ) : null;
}
