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
  const data = useAppSelector((state) => state.data);
  const dispatch = useAppDispatch();
  const hover = useAppSelector((state) => state.views.hover);

  useMouseEvent(
    MOUSE_HOVER,
    (event) => {
      getGlobalEngine()?.hover.setMousePosition([scaledXDomain.invert(event.x), scaledYDomain.invert(event.y)]);
      getGlobalEngine()?.hover.read().then((x) => {
        if (!x) {
          return;
        }
        
        if (x[1] === Number.MAX_SAFE_INTEGER) {
          dispatch(setHover(undefined));
        } else {
          dispatch(setHover([x[1]]));
        }

        
      });

      return true;
    },
    COMMAND_PRIORITY_NORMAL,
    [scaledXDomain, scaledYDomain, onHover]
  );

  return (
    <Affix position={{ bottom: rem(20), right: rem(20) }}>
      <Card shadow="lg">
        <Card.Section>
          <HoverComponent row={hover?.length === 1 ? data.rows[hover[0]] : null} />
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
      <Table withTableBorder>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
}
