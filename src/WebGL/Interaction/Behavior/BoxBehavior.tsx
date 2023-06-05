import * as React from 'react';
import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DRAG,
  MOUSE_DRAGGING,
  MOUSE_DRAG_END,
} from '../../Interaction/Commands';
import { useVisContext } from '../../VisualizationContext';
import { IRectangle, Rectangle } from '../../Math/Rectangle';
import {
  ActionIcon,
  Affix,
  Autocomplete,
  Button,
  Group,
  Menu,
  Overlay,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowsMove } from '@tabler/icons-react';
import { SpatialModel } from '../../../Store/ModelSlice';
import { openContextModal } from '@mantine/modals';
import { useDispatch } from 'react-redux';
import { VectorLike } from '../../../Interfaces';
import {
  addSubEmbedding,
  removeEmbedding,
  translateArea,
  updateEmbedding,
} from '../../../Store/ViewSlice';
import { IconX } from '@tabler/icons-react';
import { useMouseEvent } from './useMouseDrag';
import { runCondenseLayout } from '../../../Layouts/Layouts';
import { useAppSelector } from '../../../Store/hooks';

export function BoxBehavior({ parentModel }: { parentModel: SpatialModel }) {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext();

  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DRAG,
    (event) => {
      if (event.button === 2) {
        setRect(new Rectangle(event.offsetX, event.offsetY, 0, 0));
        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_NORMAL,
    []
  );

  useMouseEvent(
    MOUSE_DRAGGING,
    (event) => {
      if (rect && event.button === 2) {
        setRect((value) => {
          return new Rectangle(
            value.x,
            value.y,
            event.offsetX - value.x,
            event.offsetY - value.y
          );
        });
        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_NORMAL,
    [rect, setRect]
  );

  useMouseEvent(
    MOUSE_DRAG_END,
    (event) => {
      if (rect) {
        const worldRect = new Rectangle(
          scaledXDomain.invert(rect.x),
          scaledYDomain.invert(rect.y),
          scaledXDomain.invert(rect.x + rect.width) -
            scaledXDomain.invert(rect.x),
          scaledYDomain.invert(rect.y + rect.height) -
            scaledYDomain.invert(rect.y)
        );

        const filter = new Array<number>();

        parentModel.flatSpatial.forEach((value, key) => {
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

        setRect(null);
        return true;
      }
      return false;
    },
    COMMAND_PRIORITY_NORMAL,
    [rect]
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
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

      {parentModel?.children.map((model) => {
        return (
          <SingleBox key={model.id} area={model.area} parentModel={model} />
        );
      })}
    </div>
  );
}

function DragCover({ onMove }: { onMove: (amount: VectorLike) => void }) {
  const [drag, setDrag] = React.useState<VectorLike>(null);

  return (
    <>
      <ActionIcon
        style={{ pointerEvents: 'initial' }}
        onMouseDown={(event) => {
          setDrag({ x: event.screenX, y: event.screenY });
        }}
      >
        <IconArrowsMove />
      </ActionIcon>
      {drag ? (
        <Overlay
          style={{ pointerEvents: 'initial' }}
          opacity={0}
          fixed
          onMouseMove={(event) => {
            onMove({ x: event.movementX, y: event.movementY });
          }}
          onMouseUp={(event) => {
            setDrag(null);
          }}
        />
      ) : null}
    </>
  );
}

function SingleBox({
  area,
  parentModel,
}: {
  area: IRectangle;
  parentModel: SpatialModel;
}) {
  const { scaledXDomain, scaledYDomain, world } = useVisContext();
  const dispatch = useDispatch();
  const data = useAppSelector((state) => state.data.rows);

  React.useEffect(() => {
    console.log('mount');
  }, []);

  const handleCondense = async () => {
    const Y = await runCondenseLayout(parentModel.filter.length, area);
    console.log(Y);

    dispatch(updateEmbedding({ id: parentModel.id, Y }));
  };

  const handleGroupBy = async () => {
    const onFinish = (Y) => {
      dispatch(updateEmbedding({ id: parentModel.id, Y }));
    };
    openContextModal({
      modal: 'grouping',
      title: 'Group by',
      innerProps: {
        X: parentModel.filter.map((i) => data[i]),
        area,
        onFinish,
      },
    });
  };

  return (
    <Group
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        borderLeft: '1px solid black',
        borderBottom: '1px solid black',
      }}
    >
      <Group
        style={{
          position: 'absolute',
          top: 0,
        }}
      >
        <DragCover
          onMove={(movement) => {
            dispatch(
              translateArea({
                id: parentModel.id,
                x: world(movement.x),
                y: world(movement.y),
              })
            );
          }}
        />
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button style={{ pointerEvents: 'initial' }}>More</Button>
          </Menu.Target>

          <Menu.Dropdown style={{ pointerEvents: 'initial' }}>
            <Menu.Item onClick={handleCondense}>Condense</Menu.Item>
            <Menu.Item onClick={handleGroupBy}>Group by</Menu.Item>
            <Menu.Item
              onClick={() => {
                openContextModal({
                  modal: 'demonstration',
                  title: 't-SNE embedding',
                  size: '70%',
                  innerProps: {
                    area,
                    filter: parentModel.filter,
                    onFinish: (Y) => {
                      dispatch(updateEmbedding({ id: parentModel.id, Y }));
                    },
                  },
                });
              }}
            >
              UMAP
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <ActionIcon
          style={{ pointerEvents: 'auto', opacity: 1 }}
          onClick={() => {
            dispatch(removeEmbedding({ id: parentModel.id }));
          }}
        >
          <IconX />
        </ActionIcon>
      </Group>
    </Group>
  );
}
