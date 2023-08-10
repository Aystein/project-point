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
import { useAppSelector } from '../../../Store/hooks';
import { Row } from '../../../Store/DataSlice.';
import keys from 'lodash/keys';

export function HoverBehavior({
  positions,
  onHover,
}: {
  positions: VectorLike[];
  onHover: (index: number) => void;
}) {
  const { scaledXDomain, scaledYDomain } = useVisContext();
  const [lastHover, setLastHover] = React.useState<number>(null);
  const data = useAppSelector((state) => state.data);
  const filter = useAppSelector((state) => state.views.filter);
  
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

      const hover = tree.find(
        scaledXDomain.invert(event.x),
        scaledYDomain.invert(event.y)
      )?.index;

      if (lastHover !== hover) {
        onHover(hover);
        setLastHover(hover);
      }

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
