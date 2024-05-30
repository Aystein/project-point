import * as React from 'react';
import { quadtree } from 'd3-quadtree';
import { VectorLike } from '../../../Interfaces';
import { useMouseEvent } from './useMouseDrag';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_HOVER,
} from '../../Interaction/Commands';
import { useVisContext } from '../../VisualizationContext';
import { Affix, Box, Button, Card, Pagination, ScrollArea, Text, Table, Tabs, Transition, rem, Center } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '../../../Store/hooks';
import { Row } from '../../../Store/DataSlice.';
import keys from 'lodash/keys';
import { useDebouncedState } from '@mantine/hooks';
import { getGlobalEngine } from '../../../MainTabs/HistoryTab';
import { setHover } from '../../../Store/ViewSlice';
import { getPlugins } from '../../../Plugins/Util';

export function SelectionComponent({ summarize = false }: { summarize?: boolean }) {
  const data = useAppSelector((state) => state.data);
  const selection = useAppSelector((state) => state.views.present.selection);

  const [activePage, setPage] = React.useState(1);

  return <Box>
    {
      selection?.length > 0 ?
        summarize ? <ScrollArea.Autosize mah={300} maw={400} mx="auto">
          {getPlugins().find((value) => value.type === data.type)?.createFingerprint(selection)}
        </ScrollArea.Autosize> :

          <><Center mb="xs"><Pagination value={activePage} onChange={setPage} total={selection?.length} size="xs" /></Center>
            {data.type ? getPlugins().find((value) => value.type === data.type)?.createFingerprint([selection[activePage - 1]])

              :
              <ScrollArea.Autosize mah={300} maw={400} mx="auto">
                <HoverComponent row={data.rows[selection[activePage - 1]]} />
              </ScrollArea.Autosize>

            }
          </> : <Center p="lg">
          <Text>No selection.</Text>
        </Center>
    }
  </Box>
}

export function HoverBehavior({
  positions,
  onHover,
}: {
  positions: VectorLike[];
  onHover: (index: number) => void;
}) {
  const { scaledXDomain, scaledYDomain } = useVisContext();
  const data = useAppSelector((state) => state.data);
  const dispatch = useAppDispatch();
  const hover = useAppSelector((state) => state.views.present.hover);
  const activeTool = useAppSelector((state) => state.views.present.selectedTool);
  const selection = useAppSelector((state) => state.views.present.selection);

  useMouseEvent(
    MOUSE_HOVER,
    (event) => {
      if (activeTool === 'select') {
        getGlobalEngine()?.hover.setMousePosition([scaledXDomain.invert(event.x), scaledYDomain.invert(event.y)]);
        getGlobalEngine()?.hover.read().then((x) => {
          if (!x) {
            return;
          }
          if (x[1] > 429496729) {
            dispatch(setHover(undefined));
          } else {
            dispatch(setHover([x[1]]));
          }
        });
      }

      return true;
    },
    COMMAND_PRIORITY_NORMAL,
    [scaledXDomain, scaledYDomain, onHover, activeTool]
  );

  return (
    <Affix position={{ bottom: rem(20), right: rem(20) }} w={400} data-interaction
      onMouseMove={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onMouseUp={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}>
      <Card shadow="lg" withBorder>
        <Tabs defaultValue='hover'>
          <Tabs.List>
            <Tabs.Tab value="hover">
              Hover
            </Tabs.Tab>
            <Tabs.Tab value="select">
              Select
            </Tabs.Tab>
            <Tabs.Tab value="summary">
              Summary
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="hover" p="xs">
            {
              hover?.length > 0 ? <ScrollArea.Autosize mah={300} maw={400} mx="auto">
                {data.type ? getPlugins().find((value) => value.type === data.type).createFingerprint([hover[0]]) :
                  <HoverComponent row={hover?.length === 1 ? data.rows[hover[0]] : null} />}
              </ScrollArea.Autosize> : <Center p="lg"><Text>No hover.</Text></Center>
            }

          </Tabs.Panel>

          <Tabs.Panel value="select" p="xs">
            <SelectionComponent />
          </Tabs.Panel>

          <Tabs.Panel value="summary" p="xs">
            <SelectionComponent summarize />
          </Tabs.Panel>
        </Tabs>
        <Card.Section>

        </Card.Section>
      </Card>
    </Affix >
  );
}

function HoverComponent({ row }: { row: Row }) {
  const rows = keys(row)
    .slice(0, 30)
    .map((key) => (
      <tr key={key}>
        <td
          style={{
            textOverflow: 'ellipsis',
          }}
        >
          {key}
        </td>
        <td>{row[key]}</td>
      </tr>
    ));

  return (
    <Box>
      <Table withTableBorder>
        <tbody>{rows}</tbody>
      </Table>
    </Box>
  );
}
