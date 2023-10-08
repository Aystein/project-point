import { Box } from '@mantine/core';
import * as React from 'react';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DOWN,
} from '../../Interaction/Commands';
import { Rectangle } from '../../Math/Rectangle';
import { useVisContext } from '../../VisualizationContext';

import { useHotkeys } from '@mantine/hooks';
import { useDispatch } from 'react-redux';
import { fillOperation } from '../../../Layouts/Layouts';
import {
  activateModel,
  addSubEmbedding,
  removeEmbedding,
  updatePositionByFilter
} from '../../../Store/ViewSlice';
import { useAppSelector } from '../../../Store/hooks';
import { SpatialModel } from '../../../Store/interfaces';
import { SimpleDragCover } from './DragCover';
import { LabelsOverlay } from './LabelsOverlay';
import { useMouseEvent } from './useMouseDrag';

import { Handles, MoveHandles } from './Handles';

export function BoxBehavior() {
  const { scaledXDomain, scaledYDomain } = useVisContext();

  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  const positions = useAppSelector((state) => state.views.positions);
  const models = Object.values(
    useAppSelector((state) => state.views.models.entities)
  );

  const activeId = useAppSelector((state) => state.views.activeModel);
  const activeTool = useAppSelector((state) => state.views.selectedTool);

  const handleDelete = () => {
    dispatch(removeEmbedding({ id: activeId }));
  };

  useHotkeys([['delete', handleDelete]]);

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DOWN,
    (event) => {
      if (event.button === 0 && activeTool === 'box') {
        setRect(new Rectangle(event.offsetX, event.offsetY, 0, 0));
        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_NORMAL,
    [activeTool]
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        console.log(target);
        if (!target.hasAttribute('data-model') && !target.hasAttribute('data-interaction')) {
          dispatch(activateModel({ id: null }))
        }
      }}
      ref={ref}
    >
      {rect ? (
        <SimpleDragCover
          boxRef={ref}
          drag={{ x: rect.x, y: rect.y }}
          setDrag={async () => {
            if (rect) {
              setRect(null);

              const worldRect = new Rectangle(
                scaledXDomain.invert(rect.x),
                scaledYDomain.invert(rect.y),
                scaledXDomain.invert(rect.x + rect.width) -
                  scaledXDomain.invert(rect.x),
                scaledYDomain.invert(rect.y + rect.height) -
                  scaledYDomain.invert(rect.y)
              );

              const filter = new Array<number>();

              positions.forEach((value, key) => {
                if (worldRect.within(value)) {
                  filter.push(key);
                }
              });

              dispatch(
                addSubEmbedding({
                  filter,
                  Y: null,
                  area: worldRect,
                })
              );

              const { Y } = await fillOperation({
                N: filter.length,
                area: worldRect,
              });

              dispatch(updatePositionByFilter({ position: Y, filter }));

              return true;
            }
          }}
          onMove={(_, event) => {
            const bounds = ref.current.getBoundingClientRect();
            setRect((value) => {
              return new Rectangle(
                value.x,
                value.y,
                event.offsetX - value.x - bounds.x,
                event.offsetY - value.y - bounds.y
              );
            });
          }}
        />
      ) : null}
      {rect ? (
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            border: '3px solid var(--mantine-color-gray-filled)',
          }}
        />
      ) : null}

      {models.map((model) => {
        return <SingleBox key={model.id} model={model} />;
      })}
    </div>
  );
}


function SingleBox({ model }: { model: SpatialModel }) {
  const { scaledXDomain, scaledYDomain } = useVisContext();
  const area = model.area;
  const activeId = useAppSelector((state) => state.views.activeModel);
  const dispatch = useDispatch();

  return (
    <Box
      style={{
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        background: 'var(--mantine-color-gray-0)',
        border: `3px solid ${
          model.id === activeId
            ? 'var(--mantine-color-blue-1)'
            : 'var(--mantine-color-gray-1)'
        }`,
      }}
      onMouseDown={() => {
        dispatch(activateModel({ id: model.id }))
      }}
      data-model
    >
      <MoveHandles model={model} />

      {model.id === activeId ? <Handles model={model} /> : null}

      <LabelsOverlay labels={model.labels} area={area} />
    </Box>
  );
}
