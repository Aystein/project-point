import {
  ActionIcon,
  Box,
  Group,
  Menu
} from '@mantine/core';
import {
  IconArrowsMove,
  IconCircleLetterA,
  IconRosette,
  IconTimeline
} from '@tabler/icons-react';
import * as React from 'react';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DOWN
} from '../../Interaction/Commands';
import { Rectangle } from '../../Math/Rectangle';
import { useVisContext } from '../../VisualizationContext';

import { openContextModal } from '@mantine/modals';
import { IconX } from '@tabler/icons-react';
import { scaleOrdinal } from 'd3-scale';
import groupBy from 'lodash/groupBy';
import { useDispatch } from 'react-redux';
import { VectorLike } from '../../../Interfaces';
import {
  fillOperation,
  runSpaghettiLayout
} from '../../../Layouts/Layouts';
import { SpatialModel } from '../../../Store/interfaces';
import {
  activateModel,
  addSubEmbedding,
  removeEmbedding,
  setLines,
  setShape,
  translateArea,
  updateLabels,
  updatePositionByFilter
} from '../../../Store/ViewSlice';
import { useAppSelector } from '../../../Store/hooks';
import classes from './BoxBehavior.module.css';
import { SimpleDragCover } from './DragCover';
import { DragCoverHorizontal } from './DragCoverHorizontal';
import { DragCoverVertical } from './DragCoverVertical';
import { LabelsOverlay } from './LabelsOverlay';
import { useMouseEvent } from './useMouseDrag';
import { useHotkeys } from '@mantine/hooks';


export function BoxBehavior() {
  const { scaledXDomain, scaledYDomain } = useVisContext();

  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  const positions = useAppSelector((state) => state.views.positions);
  const models = useAppSelector((state) => Object.values(state.views.models.entities))

  const activeId = useAppSelector((state) => state.views.activeModel);
  const activeTool = useAppSelector((state) => state.settings.activeTool)


  const handleDelete = () => {
    dispatch(removeEmbedding({ id: activeId }))
  }

  useHotkeys([
    ['delete', handleDelete]
  ])

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

              const { Y } = await fillOperation({ N: filter.length, area: worldRect });
              //console.log(T);

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
            border: '1px solid black',
            borderRadius: '0.25rem',
          }}
        />
      ) : null}

      {models.map((model) => {
        return (
          <SingleBox key={model.id} model={model} />
        );
      })}
    </div>
  );
}

function SingleBox({
  model,
}: {
  model: SpatialModel;
}) {
  const { scaledXDomain, scaledYDomain, world } = useVisContext();
  const dispatch = useDispatch();
  const data = useAppSelector((state) => state.data.rows);
  const positions = useAppSelector((state) => state.views.positions);
  const area = model.area;
  const activeId = useAppSelector((state) => state.views.activeModel);

  // const layoutConfigurations = useAppSelector();

  const [drag, setDrag] = React.useState<{
    direction: 'x' | 'y' | 'xy';
    position: VectorLike;
  }>();



  const handleShape = () => {
    const onFinish = (feature: string) => {
      const filteredRows = model.filter.map((i) => data[i]);

      let shape = scaleOrdinal([0, 1, 2, 3]).domain(
        filteredRows.map((row) => row[feature])
      );

      const mappedColors = filteredRows.map((row) => shape(row[feature]));

      dispatch(
        setShape({
          id: model.id,
          shape: mappedColors,
        })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Shape by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleLine = () => {
    const onFinish = (feature: string) => {
      const filteredRows = model.filter.map((i) => data[i]);
      const grouped = groupBy(filteredRows, (value) => value[feature]);
      const lines = new Array<number>();

      Object.keys(grouped).forEach((group) => {
        const values = grouped[group];
        values.forEach((row, i) => {
          if (i < values.length - 1) {
            lines.push(values[i].index, values[i + 1].index);
          }
        });
      });

      dispatch(setLines(lines));
    };

    openContextModal({
      modal: 'colorby',
      title: 'Line by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleSpaghettiBy = async (axis: 'x' | 'y') => {
    const onFinish = async (groups: string[], secondary: string) => {
      const X = model.filter.map((i) => data[i]);

      const { Y, x, y, labels } = await runSpaghettiLayout(
        X,
        area,
        groups,
        secondary,
        axis,
        model.filter.map((i) => positions[i]),
      );

      dispatch(updateLabels({ id: model.id, labels }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: model.filter })
      );
    };

    openContextModal({
      modal: 'spaghetti',
      title: 'Spaghetti',
      innerProps: {
        onFinish,
      },
    });
  };

  return (
    <Group
      onClick={() => { console.log("test"); dispatch(activateModel({ id: model.id })) }}
      style={{
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        background: '#f8f9fa',
        border: `1px solid ${model.id === activeId ? 'var(--mantine-color-blue-3)' : 'var(--mantine-color-gray-3)'}`,
        borderRadius: '1rem',
      }}
      data-interaction
    >
      {
        activeId === model.id ? <>
          <SimpleDragCover
            onMove={(movement) => {
              dispatch(
                translateArea({
                  id: model.id,
                  x: world(movement.x),
                  y: world(movement.y),
                })
              );
            }}
            setDrag={(position) => {
              dispatch(activateModel({ id: model.id }))
              setDrag(position ? { position, direction: 'xy' } : null);
            }}
            drag={drag?.direction === 'xy' ? drag.position : null}
            style={{
              pointerEvents: 'initial',
              transform: 'translate(-50%, 50%)',
              position: 'absolute',
              bottom: 0,

            }}
            data-interaction
            icon={<IconArrowsMove />}
          />

          <DragCoverHorizontal parentModel={model} />
          <DragCoverVertical parentModel={model} />
        </> : null
      }


      <LabelsOverlay labels={model.labels} />
    </Group>
  );
}
