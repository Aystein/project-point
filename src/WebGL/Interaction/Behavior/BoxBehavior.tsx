import * as React from 'react';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DRAG_START,
} from '../../Interaction/Commands';
import { useVisContext } from '../../VisualizationContext';
import { IRectangle, Rectangle } from '../../Math/Rectangle';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Overlay,
  ThemeIcon,
  rem,
} from '@mantine/core';
import {
  IconArrowsMove,
  IconArrowMoveUp,
  IconArrowMoveRight,
} from '@tabler/icons-react';

import { SpatialModel } from '../../../Store/ModelSlice';
import { openContextModal } from '@mantine/modals';
import { useDispatch } from 'react-redux';
import { DataType, VectorLike } from '../../../Interfaces';
import {
  addSubEmbedding,
  removeEmbedding,
  setColor,
  setLines,
  setShape,
  translateArea,
  updateEmbedding,
} from '../../../Store/ViewSlice';
import { IconX } from '@tabler/icons-react';
import { useMouseEvent } from './useMouseDrag';
import { runCondenseLayout, runForceLayout } from '../../../Layouts/Layouts';
import { useAppSelector } from '../../../Store/hooks';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { getMinMax } from '../../../Util';
import groupBy from 'lodash/groupBy';
import { SimpleDragCover } from './DragCover';
import { useScatterStore } from '../../../Store/Zustand';

export function BoxBehavior({ parentModel }: { parentModel: SpatialModel }) {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext();

  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DRAG_START,
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

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      ref={ref}
    >
      {rect ? (
        <SimpleDragCover
          boxRef={ref}
          drag={{ x: rect.x, y: rect.y }}
          setDrag={(value) => {
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

      {parentModel?.children.map((model) => {
        return (
          <SingleBox key={model.id} area={model.area} parentModel={model} />
        );
      })}
    </div>
  );
}

export function DragCover({
  onMove,
  style,
  icon,
}: {
  onMove: (amount: VectorLike) => void;
  style: React.CSSProperties;
  icon;
}) {
  const [drag, setDrag] = React.useState<VectorLike>(null);

  return (
    <>
      <ActionIcon
        size="sm"
        style={style}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();

          console.log('mouse down');

          setDrag({ x: event.screenX, y: event.screenY });
        }}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        {icon}
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

  const updatePositions = useScatterStore((state) => state.updatePositions);

  const handleCondense = async () => {
    const Y = await runCondenseLayout(parentModel.filter.length, area);

    console.log(Y, parentModel.filter);
    updatePositions(Y, parentModel.filter)
    // dispatch(updateEmbedding({ id: parentModel.id, Y }));
  };

  const handleColor = () => {
    const onFinish = (feature: string) => {
      const filteredRows = parentModel.filter.map((i) => data[i]);
      let color = scaleOrdinal(schemeCategory10).domain(
        filteredRows.map((row) => row[feature])
      );

      const mappedColors = filteredRows.map((row) => color(row[feature]));

      dispatch(
        setColor({
          id: parentModel.id,
          colors: mappedColors
            .map((hex) => {
              let red = parseInt(hex.substring(1, 3), 16);
              let green = parseInt(hex.substring(3, 5), 16);
              let blue = parseInt(hex.substring(5, 7), 16);

              return [red / 255, green / 255, blue / 255, 1];
            })
            .flat(),
        })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Color by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleShape = () => {
    const onFinish = (feature: string) => {
      const filteredRows = parentModel.filter.map((i) => data[i]);
      let shape = scaleOrdinal([0, 1, 2, 3]).domain(
        filteredRows.map((row) => row[feature])
      );

      const mappedColors = filteredRows.map((row) => shape(row[feature]));

      dispatch(
        setShape({
          id: parentModel.id,
          shape: mappedColors,
        })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Color by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleLine = () => {
    const onFinish = (feature: string) => {
      const grouped = groupBy(data, (value) => value[feature]);
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

  const handleGroupBy = async () => {
    const onFinish = (Y) => {
      updatePositions(Y, parentModel.filter)
      // dispatch(updateEmbedding({ id: parentModel.id, Y }));
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

  const handleLinearScale = async (axis: 'x' | 'y') => {
    const onFinish = async (feature: string) => {
      const X = parentModel.filter
        .map((i) => data[i])
        .map((row) => row[feature]);

      const [min, max] = getMinMax(X);

      let scale = scaleLinear().domain([min, max]).range([0, 1]);

      const mapped = X.map((value) => scale(value));

      const Y = await runForceLayout({
        N: parentModel.filter.length,
        area,
        X,
        axis,
        xLayout:
          axis === 'x'
            ? mapped
            : parentModel.x ?? parentModel.spatial.map((vector) => vector.x),
        yLayout:
          axis === 'y'
            ? mapped
            : parentModel.y ?? parentModel.spatial.map((vector) => vector.y),
      });

      updatePositions(Y, parentModel.filter)
      // dispatch(updateEmbedding({ id: parentModel.id, Y }));
    };

    openContextModal({
      modal: 'colorby',
      title: 'Linear scale',
      innerProps: {
        onFinish,
        dataType: DataType.Numeric,
      },
    });
  };

  return (
    <Group
      sx={(theme) => ({
        pointerEvents: 'none',
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
      })}
    >
      <Box
        sx={(theme) => ({
          background:
            theme.colorScheme !== 'dark' ? theme.colors.dark[7] : theme.white,
          position: 'absolute',
          width: 1,
          top: rem(24),
          height: `calc(100% - ${rem(48)})`,
        })}
      />
      <Box
        sx={(theme) => ({
          background:
            theme.colorScheme !== 'dark' ? theme.colors.dark[7] : theme.white,
          position: 'absolute',
          left: rem(24),
          height: 1,
          width: `calc(100% - ${rem(48)})`,
          bottom: 0,
        })}
      />
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
        style={{
          pointerEvents: 'initial',
          transform: 'translate(-50%, 50%)',
          position: 'absolute',
          bottom: 0,
        }}
        icon={<IconArrowsMove />}
      />

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
        style={{
          pointerEvents: 'initial',
          transform: 'translate(50%, 50%)',
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}
        icon={<IconArrowMoveRight />}
      />

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
        style={{
          pointerEvents: 'initial',
          transform: 'translate(-50%, -50%)',
          position: 'absolute',
          left: 0,
          top: 0,
        }}
        icon={<IconArrowMoveUp />}
      />

      <Group
        style={{
          position: 'absolute',
          top: 0,
          left: rem(32),
        }}
      >
        <Menu shadow="md" width={200} withinPortal>
          <Menu.Target>
            <Button
              style={{ pointerEvents: 'initial' }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              X
            </Button>
          </Menu.Target>

          <Menu.Dropdown
            style={{ pointerEvents: 'initial' }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Menu.Item onClick={handleCondense}>Condense</Menu.Item>
            <Menu.Item onClick={handleGroupBy}>Group by</Menu.Item>
            <Menu.Item onClick={() => handleLinearScale('x')}>
              Linear scale
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                openContextModal({
                  modal: 'demonstration',
                  title: 't-SNE embedding',
                  size: '70%',
                  innerProps: {
                    id: parentModel.id,
                    axis: 'x',
                    onFinish: (Y) => {
                      updatePositions(Y, parentModel.filter)
                      // dispatch(updateEmbedding({ id: parentModel.id, Y }));
                    },
                  },
                });
              }}
            >
              UMAP
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              style={{ pointerEvents: 'initial' }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              Y
            </Button>
          </Menu.Target>

          <Menu.Dropdown
            style={{ pointerEvents: 'initial' }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Menu.Item onClick={handleCondense}>Condense</Menu.Item>
            <Menu.Item onClick={handleGroupBy}>Group by</Menu.Item>
            <Menu.Item onClick={() => handleLinearScale('y')}>
              Linear scale
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                openContextModal({
                  modal: 'demonstration',
                  title: 't-SNE embedding',
                  size: '70%',
                  innerProps: {
                    id: parentModel.id,
                    axis: 'y',
                    onFinish: (Y) => {
                      updatePositions(Y, parentModel.filter)
                      // dispatch(updateEmbedding({ id: parentModel.id, Y }));
                    },
                  },
                });
              }}
            >
              UMAP
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              style={{ pointerEvents: 'initial' }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              Channel
            </Button>
          </Menu.Target>

          <Menu.Dropdown
            style={{ pointerEvents: 'initial' }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Menu.Item onClick={handleColor}>Color</Menu.Item>
            <Menu.Item onClick={handleShape}>Shape</Menu.Item>
            <Menu.Item onClick={handleLine}>Line</Menu.Item>
            <Menu.Item
              onClick={() => {
                openContextModal({
                  modal: 'demonstration',
                  title: 't-SNE embedding',
                  size: '70%',
                  innerProps: {
                    id: parentModel.id,
                    axis: 'xy',
                    onFinish: (Y) => {
                      updatePositions(Y, parentModel.filter)
                      // dispatch(updateEmbedding({ id: parentModel.id, Y }));
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
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            dispatch(removeEmbedding({ id: parentModel.id }));
          }}
        >
          <IconX />
        </ActionIcon>
      </Group>
    </Group>
  );
}
