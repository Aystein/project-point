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
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import classes from './SideMenu.module.css';
import { ColorConfiguration } from '../Store/interfaces';
import { setHover, setSelection } from '../Store/ViewSlice';

export function ColorLegend() {
  const model = useAppSelector(selectActiveModel);
  const config = useAppSelector(selectConfigByChannel('color')) as ColorConfiguration;
  const dispatch = useAppDispatch();

  const handleMouseEnter = (value) => {
    dispatch(setHover(value.indices))
  }

  const handleClick = (value) => {
    dispatch(setSelection(value.indices))
  }

  return (
    <ScrollArea.Autosize mah={400}>
      <Box p="xs">
        <Text truncate="end" maw="calc(16rem - 40px)"><Text>Color</Text><Text span fw={500}>by {config.column}</Text></Text>
        <Stack gap="xs" mt="sm">
          {model.colorFilter.map((value) => {
            return (
              <Group key={value.column}>
                <ColorSwatch
                  component="button"
                  onMouseEnter={() => handleMouseEnter(value)}
                  onClick={() => handleClick(value)}
                  // onClick={() => setChecked((c) => !c)}
                  style={{ color: '#fff', cursor: 'pointer' }}
                  color={value.color}
                  size={rem(20)}
                />
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
