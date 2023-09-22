import * as React from 'react';
import {
  Badge,
  Divider,
  Group,
  Paper,
  Radio,
  Select,
  Stack,
  Tabs,
} from '@mantine/core';
import classes from './SideMenu.module.css';
import { useAppSelector } from '../Store/hooks';
import { ChannelPanel } from './LayoutPanels/XChannelPanel';



export function SideMenu() {
  /**const view = useAppSelector((state) =>
    state.views.workspace?.children.find(
      (e) => e.id === state.views.activeModel
    )
  );**/

  const data = [
    { label: 'X', value: 'x' },
    { label: 'Y', value: 'y' },
    { label: 'Color', value: 'color' },
    { label: 'Size', value: 'size' },
    { label: 'Shape', value: 'shape' },
  ];

  const [value, setValue] = React.useState(data[0].value);
  

  return (
    <Paper
      className={classes.sidemenu}
      withBorder
      radius="md"
      shadow="md"
      p="xs"
    >
      <Stack>
        <Select
          data={data}
          value={value}
          onChange={setValue}
          label="Select channel"
        />

        <Tabs color="teal" value={value}>
          <Tabs.Panel value="x">
            <ChannelPanel channel='x' />
          </Tabs.Panel>
          <Tabs.Panel value="y">
            <ChannelPanel channel='y' />
          </Tabs.Panel>
          <Tabs.Panel value={data[1].value}>hello2</Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
}
