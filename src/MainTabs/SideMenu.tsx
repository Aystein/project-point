import { Group, Paper, Pill, Select, Stack, Tabs } from '@mantine/core';
import { EntityId } from '@reduxjs/toolkit';
import capitalize from 'lodash/capitalize';
import * as React from 'react';
import {
  selectActiveModel,
  selectAllModels,
  selectChannelTypes,
} from '../Store/Selectors';
import { removeLayoutConfigAsync } from '../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import { ColorConfiguration, LayoutConfiguration } from '../Store/interfaces';
import { AxisPanel } from './LayoutPanels/AxisPanel';
import { ColorPanel } from './LayoutPanels/ColorPanel';
import { LinePanel } from './LayoutPanels/LinePanel';
import { XYPanel } from './LayoutPanels/XYPanel';
import classes from './SideMenu.module.css';

export function ModelSideMenu({
  data,
  modelId,
  layoutConfigurations,
}: {
  data: { label: string; value: string }[];
  modelId: EntityId;
  layoutConfigurations: LayoutConfiguration[];
}) {
  const dispatch = useAppDispatch();

  const [value, setValue] = React.useState(data[0].value);

  const usedChannels = useAppSelector(selectChannelTypes);

  return (
    <Paper
      className={classes.sidemenu}
      withBorder
      radius="md"
      shadow="md"
      p="xs"
      key={modelId}
    >
      <Stack gap="lg">
        <Group>
          {usedChannels.map((channel) => {
            return (
              <Pill
                key={channel}
                withRemoveButton
                onRemove={() => dispatch(removeLayoutConfigAsync({ channel }))}
              >
                {capitalize(channel)}
              </Pill>
            );
          })}
        </Group>

        <Select
          data={data}
          value={value}
          onChange={setValue}
          label="Select channel"
          maxLength={10}
          maxDropdownHeight={500}
        />

        <Tabs color="teal" value={value} keepMounted={false}>
          <Tabs.Panel value="x">
            <AxisPanel
              channel="x"
              defaultValue={layoutConfigurations.find(
                (config) => config.channel === 'x'
              )}
            />
          </Tabs.Panel>
          <Tabs.Panel value="y">
            <AxisPanel
              channel="y"
              defaultValue={layoutConfigurations.find(
                (config) => config.channel === 'y'
              )}
            />
          </Tabs.Panel>
          <Tabs.Panel value="xy">
            <XYPanel
              defaultValue={layoutConfigurations.find(
                (config) => config.channel === 'xy'
              )}
            />
          </Tabs.Panel>
          <Tabs.Panel value="color">
            <ColorPanel
              defaultValue={
                layoutConfigurations.find(
                  (config) => config.channel === 'color'
                ) as ColorConfiguration
              }
            />
          </Tabs.Panel>
          <Tabs.Panel value="line">
            <LinePanel
              defaultValue={
                layoutConfigurations.find(
                  (config) => config.channel === 'line'
                ) as ColorConfiguration
              }
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
}

export function SideMenu() {
  const activeModel = useAppSelector(selectActiveModel);
  const layoutConfigurations = Object.values(
    useAppSelector(
      (state) =>
        state.views.models.entities[state.views.activeModel]
          ?.layoutConfigurations.entities
    ) ?? {}
  ) as LayoutConfiguration[];

  const models = useAppSelector(selectAllModels);

  const data = [
    { label: 'X', value: 'x' },
    { label: 'Y', value: 'y' },
    { label: 'X & Y', value: 'xy' },
    { label: 'Color', value: 'color' },
    { label: 'Size', value: 'size' },
    { label: 'Shape', value: 'shape' },
    { label: 'Line', value: 'line' },
  ];

  return <Tabs value={activeModel?.id as string}>
    {models.map((model) => {
      return (
        <Tabs.Panel key={model.id} value={model.id as string}>
          <ModelSideMenu
            data={data}
            modelId={model.id}
            layoutConfigurations={layoutConfigurations}
          />
        </Tabs.Panel>
      );
    })}
  </Tabs>;
}
