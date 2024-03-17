import {
  Box,
  Button,
  CheckIcon,
  ColorSwatch,
  Combobox,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { useDispatch } from 'react-redux';
import {
  Selectors,
  selectActiveModel,
  selectChannelTypes,
  selectConfigByChannel,
} from '../Store/Selectors';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import cloneDeep from 'lodash/cloneDeep'
import classes from './SideMenu.module.css';
import { ColorConfiguration, LineConfiguration } from '../Store/interfaces';
import { setHover, setSelection } from '../Store/ViewSlice';

export function LineLegend() {
  const model = useAppSelector(selectActiveModel);
  const config = useAppSelector(
    selectConfigByChannel('line')
  ) as LineConfiguration;
  const dispatch = useAppDispatch();

  const selection = useAppSelector((state) => state.views.selection);
  const rows = useAppSelector((state) => state.data.rows);
  const activeModel = useAppSelector(selectActiveModel);

  const handleMouseEnter = (value) => {
    dispatch(setHover(value.indices));
  };

  const handleClick = (value) => {
    dispatch(setSelection(value.indices));
  };

  const handleExpand = () => {
    const lineSet = new Set(selection.map((i) => rows[i]).map((v) => v[config.column]));
    const newSelection = rows.filter((row) => lineSet.has(row[config.column])).map((row) => row.index);

    dispatch(setSelection(newSelection));
  }

  const handleCombine = () => {
    console.log(cloneDeep(activeModel.lineFilter));
    const lineFilter = activeModel.lineFilter;

    const minMax: Record<string, { min: number, max: number }> = {};
    Object.keys(lineFilter).forEach((key) => {
      minMax[key] = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };
    })

    selection.forEach((index) => {
      const lineValue = rows[index][config.column];

      const indexInLine = lineFilter[lineValue].reverseIndices[index];
      minMax[lineValue].min = Math.min(minMax[lineValue].min, indexInLine);
      minMax[lineValue].max = Math.max(minMax[lineValue].max, indexInLine);
    })

    const selectionSet = new Set(selection);


    const lineSet = new Set(selection.map((i) => rows[i]).map((v) => v[config.column]));
    const newSelection = rows.filter((row) => {
      const lineValue = row[config.column];
      return lineSet.has(row[config.column]) && lineFilter[lineValue].reverseIndices[row.index] >= minMax[lineValue].min
        && lineFilter[lineValue].reverseIndices[row.index] <= minMax[lineValue].max
    }).map((row) => row.index);

    dispatch(setSelection(newSelection));
  }

  return (
    <Stack p="xs">
      <Text truncate="end" maw="calc(16rem - 40px)">
        <Text>Line</Text>
        <Text span fw={500}>
          by {config.column}
        </Text>
      </Text>

      <Divider orientation='vertical' mx="xs" my="xs" />

      <Group gap={rem(4)} wrap="nowrap">
        <Tooltip label="Expands the selection to their full sequences.">
          <Button
            style={{ textTransform: 'uppercase' }}
            onClick={() => {
              handleExpand();
            }}
            variant="subtle"
            radius="md"
            color="dark"
          >
            Expand
          </Button>
        </Tooltip>

        <Tooltip label="Adds the inbetween states of the selected items.">
          <Button
            style={{ textTransform: 'uppercase' }}
            onClick={() => {
              handleCombine();
            }}
            variant="subtle"
            radius="md"
            color="dark"
          >
            Combine
          </Button>
        </Tooltip>
      </Group>

      <Combobox>
        <Combobox.Options mt="sm">
          <ScrollArea.Autosize type="scroll" mah={200}>
            {model.lineFilter.map((value) => {
              return (
                <Combobox.Option
                  onMouseEnter={() => handleMouseEnter(value)}
                  onClick={() => handleClick(value)}
                  key={value.value}
                  value={value.value}
                >
                  {value.value}
                </Combobox.Option>
              );
            })}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox>
    </Stack>
  );
}

export function ColorLegend() {
  const model = useAppSelector(selectActiveModel);
  const config = useAppSelector(
    selectConfigByChannel('color')
  ) as ColorConfiguration;
  const dispatch = useAppDispatch();

  const handleMouseEnter = (value) => {
    dispatch(setHover(value.indices));
  };

  const handleClick = (value) => {
    dispatch(setSelection(value.indices));
  };

  return (
    <ScrollArea.Autosize mah={400}>
      <Box p="xs">
        <Text truncate="end" maw="calc(16rem - 40px)">
          <Text>Color</Text>
          <Text span fw={500}>
            by {config.column}
          </Text>
        </Text>
        <Combobox>
          <Combobox.Options mt="sm">
            <ScrollArea.Autosize type="scroll" mah={200}>
              {model.colorFilter.map((value) => {
                return (
                  <Combobox.Option
                    onMouseEnter={() => handleMouseEnter(value)}
                    onClick={() => handleClick(value)}
                    key={value.column}
                    value={value.column}
                  >
                    <Group key={value.column}>
                      <ColorSwatch
                        // onClick={() => setChecked((c) => !c)}
                        style={{ color: '#fff', cursor: 'pointer' }}
                        color={value.color}
                        size={rem(20)}
                      />
                      {value.column}
                    </Group>
                  </Combobox.Option>
                );
              })}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox>
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

  const color = activeModel && activeModel.colorFilter ? <ColorLegend /> : null;
  const line =
    activeModel && activeModel.line.length > 0 ? <LineLegend /> : null;

  return color || line ? (
    <Paper
      className={classes.legends}
      withBorder
      radius="md"
      shadow="md"
      p={0}
      key={activeModel.id}
    >
      {color}
      {line}
    </Paper>
  ) : null;
}
