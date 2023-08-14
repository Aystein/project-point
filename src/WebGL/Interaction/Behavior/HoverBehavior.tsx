import * as React from 'react';
import { quadtree } from 'd3-quadtree';
import { VectorLike } from '../../../Interfaces';
import { useMouseEvent } from './useMouseDrag';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_HOVER,
} from '../../Interaction/Commands';
import { useVisContext } from '../../VisualizationContext';
import { Affix, Button, Card, Table, Transition, rem } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '../../../Store/hooks';
import { Row } from '../../../Store/DataSlice.';
import keys from 'lodash/keys';
import { useDebouncedState } from '@mantine/hooks';
import { getGlobalEngine } from '../../../MainTabs/HistoryTab';
import { setHover } from '../../../Store/ViewSlice';

export function HoverBehavior({
  positions,
  onHover,
}: {
  positions: VectorLike[];
  onHover: (index: number) => void;
}) {
  const { scaledXDomain, scaledYDomain } = useVisContext();
  const [lastHover, setLastHover] = useDebouncedState<number>(null, null);
  const data = useAppSelector((state) => state.data);
  const filter = useAppSelector((state) => state.views.filter);
  const dispatch = useAppDispatch();
  
  const tree = React.useMemo(() => {
    return positions
      ? quadtree<VectorLike & { index: number }>()
          .x((d) => d.x)
          .y((d) => d.y)
          .addAll(positions.map((value, i) => ({ ...value, index: filter[i] })))
      : null;
  }, [positions]);

  useMouseEvent(
    MOUSE_HOVER,
    (event) => {
      if (!tree) {
        return false;
      }

      getGlobalEngine()?.hover.setMousePosition([scaledXDomain.invert(event.x), scaledYDomain.invert(event.y)]);
      getGlobalEngine()?.hover.read().then((x) => {
        if (!x) return;
        dispatch(setHover([x[1]]));
        setLastHover(x[1]);
      });

      /*const hover = tree.find(
        scaledXDomain.invert(event.x),
        scaledYDomain.invert(event.y)
      )?.index;

      if (lastHover !== hover) {
        dispatch(setHover([hover]));
        setLastHover(hover);
      }*/

      return true;
    },
    COMMAND_PRIORITY_NORMAL,
    [tree, scaledXDomain, scaledYDomain, onHover, lastHover, setLastHover]
  );

  return (
    <Affix position={{ bottom: rem(20), right: rem(20) }}>
      <Card shadow="lg">
        <Card.Section>
          <HoverComponent row={data.rows[lastHover]} />
        </Card.Section>
      </Card>
    </Affix>
  );
}

function HoverComponent({ row }: { row: Row }) {
  const rows = keys(row)
    .slice(0, 10)
    .map((key) => (
      <tr key={key}>
        <td
          style={{
            width: rem(150),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {key}
        </td>
        <td>{row[key]}</td>
      </tr>
    ));

  return (
    <div
      style={{
        width: rem(400),
        maxHeight: rem(600),
        overflowY: 'auto',
      }}
    >
      <Table withBorder withColumnBorders>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
}
