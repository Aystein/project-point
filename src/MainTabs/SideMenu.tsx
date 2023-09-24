import * as React from 'react';
import {
  Badge,
  Divider,
  Group,
  Paper,
  Pill,
  Radio,
  Select,
  Stack,
  Tabs,
} from '@mantine/core';
import classes from './SideMenu.module.css';
import { useAppSelector } from '../Store/hooks';
import { AxisPanel } from './LayoutPanels/AxisPanel';
import { selectActiveModel, selectChannelTypes, selectModelById } from '../Store/Selectors';
import { ColorConfiguration, LayoutConfiguration } from '../Store/interfaces';
import { XYPanel } from './LayoutPanels/XYPanel';
import { ColorPanel } from './LayoutPanels/ColorPanel';
import capitalize from 'lodash/capitalize';
import { useDispatch } from 'react-redux';
import { removeLayoutConfig } from '../Store/ViewSlice';
import { LinePanel } from './LayoutPanels/LinePanel';



export function SideMenu() {
  const activeModel = useAppSelector(selectActiveModel);
  const layoutConfigurations = useAppSelector((state) => Object.values(state.views.models.entities[state.views.activeModel]?.layoutConfigurations.entities ?? {})) as LayoutConfiguration[]
  const usedChannels = useAppSelector(selectChannelTypes);
  const dispatch = useDispatch();

  const data = [
    { label: 'X', value: 'x' },
    { label: 'Y', value: 'y' },
    { label: 'X & Y', value: 'xy' },
    { label: 'Color', value: 'color' },
    { label: 'Size', value: 'size' },
    { label: 'Shape', value: 'shape' },
    { label: 'Line', value: 'line' }
  ];

  const [value, setValue] = React.useState(data[0].value);

  return (
    activeModel ? <Paper
      className={classes.sidemenu}
      withBorder
      radius="md"
      shadow="md"
      p="xs"
      key={activeModel.id}
    >
      <Stack gap="lg">
        <Group>
          {usedChannels.map((channel) => {
            return <Pill key={channel} withRemoveButton onRemove={() => dispatch(removeLayoutConfig({ channel }))}>{capitalize(channel)}</Pill>
          })}
        </Group>

        <Select
          data={data}
          value={value}
          onChange={setValue}
          label="Select channel"
        />

        <Tabs color="teal" value={value} keepMounted={false}>
          <Tabs.Panel value="x">
            <AxisPanel channel='x' defaultValue={layoutConfigurations.find((config) => config.channel === 'x')} />
          </Tabs.Panel>
          <Tabs.Panel value="y">
            <AxisPanel channel='y' defaultValue={layoutConfigurations.find((config) => config.channel === 'y')} />
          </Tabs.Panel>
          <Tabs.Panel value='xy'>
            <XYPanel defaultValue={layoutConfigurations.find((config) => config.channel === 'xy')} />
          </Tabs.Panel>
          <Tabs.Panel value="color">
            <ColorPanel defaultValue={layoutConfigurations.find((config) => config.channel === 'color') as ColorConfiguration} />
          </Tabs.Panel>
          <Tabs.Panel value="line">
            <LinePanel defaultValue={layoutConfigurations.find((config) => config.channel === 'line') as ColorConfiguration} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper> : null
  );
}
