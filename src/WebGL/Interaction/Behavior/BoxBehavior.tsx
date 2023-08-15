import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  rem
} from '@mantine/core';
import {
  IconArrowMoveRight,
  IconArrowMoveUp,
  IconArrowsMove,
  IconCircle,
  IconCircleLetterA,
  IconPaint,
  IconPalette,
  IconRosette,
  IconShape,
  IconTimeline,
} from '@tabler/icons-react';
import * as React from 'react';
import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DOWN,
  MOUSE_DRAG_START,
} from '../../Interaction/Commands';
import { IRectangle, Rectangle } from '../../Math/Rectangle';
import { useVisContext } from '../../VisualizationContext';

import { openContextModal } from '@mantine/modals';
import { IconX } from '@tabler/icons-react';
import { color } from 'd3-color';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import groupBy from 'lodash/groupBy';
import { useDispatch } from 'react-redux';
import { DataType, VectorLike } from '../../../Interfaces';
import {
  fillOperation,
  runCondenseLayout,
  runForceLayout,
  runGroupLayout,
  runSpaghettiLayout,
} from '../../../Layouts/Layouts';
import { LabelContainer, SpatialModel } from '../../../Store/ModelSlice';
import {
  addSubEmbedding,
  changeSize,
  removeEmbedding,
  setColor,
  setLines,
  setShape,
  translateArea,
  updateLabels,
  updatePositionByFilter,
  updateTrueEmbedding,
} from '../../../Store/ViewSlice';
import { useAppSelector } from '../../../Store/hooks';
import { getMinMax } from '../../../Util';
import { SimpleDragCover } from './DragCover';
import { LabelsOverlay } from './LabelsOverlay';
import { useMouseEvent } from './useMouseDrag';

export function BoxBehavior({ parentModel }: { parentModel: SpatialModel }) {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext();

  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  const x = useAppSelector((state) => state.views.workspace.x);
  const y = useAppSelector((state) => state.views.workspace.y);

  const positions = useAppSelector((state) => state.views.positions);

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DOWN,
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

              /*const { Y } = await runForceLayout({
                N: filter.length,
                area: worldRect,
                axis: 'xy',
                xLayout: filter.map((index) => x[index]),
                yLayout: filter.map((index) => y[index]),
              });*/

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

      {parentModel?.children.map((model) => {
        return (
          <SingleBox key={model.id} area={model.area} parentModel={model} />
        );
      })}
    </div>
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
  const xLayout = useAppSelector((state) => state.views.workspace.x);
  const yLayout = useAppSelector((state) => state.views.workspace.y);

  const [drag, setDrag] = React.useState<{
    direction: 'x' | 'y' | 'xy';
    position: VectorLike;
  }>();

  const handleCondense = async (axis: 'x' | 'y' | 'xy') => {
    const { Y, x, y } = await runCondenseLayout(
      parentModel.filter.length,
      area,
      axis,
      parentModel.filter.map((index) => xLayout[index]),
      parentModel.filter.map((index) => yLayout[index])
    );

    dispatch(updateLabels({
      id: parentModel.id, labels: {
        discriminator: 'positionedlabels',
        type: axis !== 'xy' ? axis : 'absolute',
        labels: [],
      }
    }));
    dispatch(updateTrueEmbedding({ id: parentModel.id, x, y }));
    dispatch(
      updatePositionByFilter({ position: Y, filter: parentModel.filter })
    );
  };

  const handleColor = () => {
    const onFinish = (feature: string, type: string) => {
      const filteredRows = parentModel.filter
        .map((i) => data[i])
        .map((row) => row[feature]);
      const extent = getMinMax(filteredRows);

      let colorScale =
        type === 'categorical'
          ? scaleOrdinal(schemeCategory10).domain(filteredRows)
          : scaleLinear<string>().domain(extent).range(['red', 'green']);

      const mappedColors = filteredRows.map((row) =>
        color(colorScale(row)).formatHex()
      );

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
      title: 'Shape by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleLine = () => {
    const onFinish = (feature: string) => {
      const filteredRows = parentModel.filter.map((i) => data[i]);
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

    const onFinish = async (feature: string) => {
      const X = parentModel.filter.map((i) => data[i]);

      const { Y, x, y, labels } = await runSpaghettiLayout(
        X,
        area,
        feature,
        axis,
      );

      dispatch(updateLabels({ id: parentModel.id, labels }));
      dispatch(updateTrueEmbedding({ id: parentModel.id, x, y }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: parentModel.filter })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Group by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleGroupBy = async (axis: 'x' | 'y') => {

    const onFinish = async (feature: string) => {
      const X = parentModel.filter.map((i) => data[i]);

      const { Y, x, y, labels } = await runGroupLayout(
        X,
        area,
        feature,
        axis,
        parentModel.filter.map((index) => xLayout[index]),
        parentModel.filter.map((index) => yLayout[index])
      );

      dispatch(updateLabels({ id: parentModel.id, labels }));
      dispatch(updateTrueEmbedding({ id: parentModel.id, x, y }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: parentModel.filter })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Group by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleLinearScale = async (axis: 'x' | 'y') => {
    const onFinish = async (feature: string) => {
      const X = parentModel.filter
        .map((i) => data[i])
        .map((row) => row[feature]);

      const domain = getMinMax(X);

      let scale = scaleLinear().domain(domain).range([0, 1]);

      const mapped = X.map((value) => scale(value));

      const { Y, x, y } = await runForceLayout({
        N: parentModel.filter.length,
        area,
        axis,
        xLayout:
          axis === 'x'
            ? mapped
            : parentModel.filter.map((index) => xLayout[index]),
        yLayout:
          axis === 'y'
            ? mapped
            : parentModel.filter.map((index) => yLayout[index]),
      });

      const labels: LabelContainer = {
        discriminator: 'scalelabels',
        type: axis,
        labels: {
          domain,
          range: [0, 1],
        },
      };

      dispatch(updateLabels({ id: parentModel.id, labels }));
      dispatch(updateTrueEmbedding({ id: parentModel.id, x, y }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: parentModel.filter })
      );
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
      style={{
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        background: '#f8f9fa',
      }}
    >
      <Menu shadow="md" width={200} position='left' withArrow>
        <Menu.Target>

          <Box
            px={7}
            sx={(theme) => ({
              position: 'absolute',
              width: 16,
              top: rem(24),
              left: -8,
              height: `calc(100% - ${rem(48)})`,
              '&:hover': {
                '> div': { background: '#1c7ed6' },
              },
              pointerEvents: 'initial'
            })}
            data-interaction
          >
            <Box data-interaction sx={(theme) => ({
              height: '100%',
              background:
                theme.colorScheme !== 'dark' ? theme.colors.dark[2] : theme.white,
            })}></Box>
          </Box>
        </Menu.Target>

        <Menu.Dropdown
          style={{ pointerEvents: 'initial' }}

          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Menu.Item onClick={() => handleCondense('y')}>Condense</Menu.Item>
          <Menu.Item onClick={() => handleGroupBy('y')}>Group by</Menu.Item>
          <Menu.Item onClick={() => handleSpaghettiBy('y')}>Spaghetti</Menu.Item>
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
                  onFinish: ({ Y, x, y }) => {
                    dispatch(
                      updateTrueEmbedding({ y, x, id: parentModel.id })
                    );
                    dispatch(
                      updatePositionByFilter({
                        position: Y,
                        filter: parentModel.filter,
                      })
                    );
                  },
                },
              });
            }}
          >
            UMAP
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Menu shadow="md" width={200} position="bottom">
        <Menu.Target>
          <Box
            py={7}
            sx={(theme) => ({
              position: 'absolute',
              left: rem(24),
              height: 16,
              width: `calc(100% - ${rem(48)})`,
              bottom: -8,
              '&:hover': {
                '> div': { background: '#1c7ed6' },
              },
              pointerEvents: 'initial'
            })}
            data-interaction
          >
            <Box data-interaction sx={(theme) => ({
              height: '100%',
              background:
                theme.colorScheme !== 'dark' ? theme.colors.dark[2] : theme.white,
            })}></Box>
          </Box>

        </Menu.Target>

        <Menu.Dropdown
          style={{ pointerEvents: 'initial' }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <Menu.Item onClick={() => handleCondense('x')}>Condense</Menu.Item>
          <Menu.Item onClick={() => handleGroupBy('x')}>Group by</Menu.Item>
          <Menu.Item onClick={() => handleSpaghettiBy('x')}>Spaghetti</Menu.Item>
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
                  onFinish: ({ Y, x, y }) => {
                    dispatch(
                      updateTrueEmbedding({ y, x, id: parentModel.id })
                    );
                    dispatch(
                      updatePositionByFilter({
                        position: Y,
                        filter: parentModel.filter,
                      })
                    );
                  },
                },
              });
            }}
          >
            UMAP
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>


      <SimpleDragCover
        onMove={(movement) => {
          dispatch(
            translateArea({
              id: parentModel.id,
              x: world(movement.x),
              y: world(movement.y),
            })
          );
        }}
        setDrag={(position) => {
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

      <SimpleDragCover
        setDrag={async (position) => {
          setDrag(position ? { position, direction: 'x' } : null);

          if (!position) {
            const { Y } = await runForceLayout({
              N: parentModel.filter.length,
              area: parentModel.area,
              axis: 'xy',
              xLayout: parentModel.filter.map((index) => xLayout[index]),
              yLayout: parentModel.filter.map((index) => yLayout[index]),
            });

            dispatch(
              updatePositionByFilter({
                position: Y,
                filter: parentModel.filter,
              })
            );
          }
        }}
        drag={drag?.direction === 'x' ? drag.position : null}
        onMove={(movement) => {
          dispatch(
            changeSize({
              id: parentModel.id,
              width:
                parentModel.area.width +
                (scaledXDomain.invert(movement.x) - scaledXDomain.invert(0)),
              height: parentModel.area.height,
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

      <SimpleDragCover
        onMove={(movement) => {
          dispatch(
            changeSize({
              id: parentModel.id,
              height:
                parentModel.area.height +
                (scaledYDomain.invert(movement.y) - scaledYDomain.invert(0)),
              width: parentModel.area.width,
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
        setDrag={(position) => {
          setDrag(position ? { position, direction: 'y' } : null);
        }}
        drag={drag?.direction === 'y' ? drag.position : null}
      />

      <Group
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          transform: 'translateY(-100%)',
        }}
        spacing="lg"
      >
        <Group spacing="xs">
          <Menu>
            <Menu.Target>
              <ActionIcon style={{ pointerEvents: 'auto' }}>
                <IconCircleLetterA />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown
              style={{ pointerEvents: 'initial' }}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              <Menu.Item
                onClick={() => {
                  openContextModal({
                    modal: 'demonstration',
                    title: 't-SNE embedding',
                    size: '70%',
                    innerProps: {
                      id: parentModel.id,
                      axis: 'xy',
                      onFinish: ({ Y, x, y }) => {
                        dispatch(
                          updateTrueEmbedding({ y, x, id: parentModel.id })
                        );
                        dispatch(
                          updatePositionByFilter({
                            position: Y,
                            filter: parentModel.filter,
                          })
                        );
                      },
                    },
                  });
                }}
              >
                UMAP
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleColor()}>
            <IconPaint />
          </ActionIcon>

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleShape()}>
            <IconRosette />
          </ActionIcon>

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleLine()}>
            <IconTimeline />
          </ActionIcon>
        </Group>


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

      <LabelsOverlay labels={parentModel.labels} />
    </Group>
  );
}
