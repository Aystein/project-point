import {
  ActionIcon,
  Box,
  Group,
  Menu,
  rem
} from '@mantine/core';
import {
  IconArrowsMove,
  IconCircleLetterA,
  IconPaint,
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
  activateModel,
  addSubEmbedding,
  removeEmbedding,
  setColor,
  setLines,
  setShape,
  translateArea,
  updateLabels,
  updatePositionByFilter,
} from '../../../Store/ViewSlice';
import { useAppSelector } from '../../../Store/hooks';
import { getMinMax } from '../../../Util';
import { SimpleDragCover } from './DragCover';
import { DragCoverHorizontal } from './DragCoverHorizontal';
import { DragCoverVertical } from './DragCoverVertical';
import { LabelsOverlay } from './LabelsOverlay';
import { useMouseEvent } from './useMouseDrag';
import classes from './BoxBehavior.module.css';


export function BoxBehavior() {
  const { scaledXDomain, scaledYDomain } = useVisContext();

  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<Rectangle>();
  const dispatch = useDispatch();

  const positions = useAppSelector((state) => state.views.positions);
  const models = useAppSelector((state) => Object.values(state.views.models.entities))

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DOWN,
    (event) => {
      if (event.button === 2 || (event.button === 0 && (event.altKey || event.ctrlKey || event.shiftKey))) {
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

  // const layoutConfigurations = useAppSelector();

  const [drag, setDrag] = React.useState<{
    direction: 'x' | 'y' | 'xy';
    position: VectorLike;
  }>();

  const handleCondense = async (axis: 'x' | 'y' | 'xy') => {
    const { Y, labels } = await runCondenseLayout(
      model.filter.length,
      area,
      axis,
      model.filter.map((i) => positions[i])
    );

    dispatch(updateLabels({
      id: model.id, labels
    }));
    // dispatch(updateTrueEmbedding({ id: parentModel.id, x, y }));
    dispatch(
      updatePositionByFilter({ position: Y, filter: model.filter })
    );
  };

  const handleColor = () => {
    const onFinish = (feature: string, type: string) => {
      const filteredRows = model.filter
        .map((i) => data[i])
        .map((row) => row[feature]);
      const extent = getMinMax(filteredRows);

      let colorScale =
        type === 'categorical'
          ? scaleOrdinal(schemeCategory10).domain(filteredRows)
          : scaleLinear<string>().domain(extent).range(['red', 'green']);

      const mappedColors = filteredRows.map((row) => {
        // console.log(colorScale(row));
        return color(colorScale(row)).formatHex()
      });

      dispatch(
        setColor({
          id: model.id,
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

  const handleGroupBy = async (axis: 'x' | 'y') => {
    const onFinish = async (groups) => {
      const X = model.filter.map((i) => data[i]);

      const { Y, x, y, labels } = await runGroupLayout(
        X,
        area,
        groups,
        axis,
      );

      dispatch(updateLabels({ id: model.id, labels }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: model.filter })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Spaghetti',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleLinearScale = async (axis: 'x' | 'y') => {
    const onFinish = async (feature: string) => {
      const X = model.filter
        .map((i) => data[i])
        .map((row) => row[feature]);

      const domain = getMinMax(X);

      let scale = scaleLinear().domain(domain).range([0, 1]);

      const mapped = X.map((value) => scale(value));

      const labels: LabelContainer = {
        discriminator: 'scalelabels',
        type: axis,
        labels: {
          domain,
          range: [0, 1],
        },
      };

      const { Y } = await runForceLayout({
        N: model.filter.length,
        area,
        axis,
        Y_in: model.filter.map((i) => positions[i]),
        X: mapped
      });

      dispatch(updateLabels({ id: model.id, labels: [labels] }));
      dispatch(
        updatePositionByFilter({ position: Y, filter: model.filter })
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
      onClick={() => { console.log("test"); dispatch(activateModel({ id: model.id })) }}
      style={{
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        background: '#f8f9fa',
      }}
      data-interaction
    >
      <Menu shadow="md" width={200} position='left' withArrow>
        <Menu.Target>

          <Box
            px={7}
            className={classes.axisL}
            data-interaction
          >
            <Box data-interaction className={classes.innerBoxL}></Box>
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
                  id: model.id,
                  axis: 'y',
                  onFinish: ({ Y, labels }) => {
                    dispatch(updateLabels({ id: model.id, labels }));
                    dispatch(
                      updatePositionByFilter({
                        position: Y,
                        filter: model.filter,
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
            className={classes.axisR}
            data-interaction
          >
            <Box data-interaction className={classes.innerBoxR}></Box>
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
                  id: model.id,
                  axis: 'x',
                  onFinish: ({ Y, labels }) => {
                    dispatch(updateLabels({ id: model.id, labels }));
                    dispatch(
                      updatePositionByFilter({
                        position: Y,
                        filter: model.filter,
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

      <Group
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          transform: 'translateY(-100%)',
        }}
        gap="lg"
      >
        <Group gap="xs">
          <Menu>
            <Menu.Target>
              <ActionIcon style={{ pointerEvents: 'auto' }} variant="subtle">
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
                      id: model.id,
                      axis: 'xy',
                      onFinish: ({ Y, labels }) => {
                        dispatch(updateLabels({ id: model.id, labels }));
                        dispatch(
                          updatePositionByFilter({
                            position: Y,
                            filter: model.filter,
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

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleColor()} variant="subtle">
            <IconPaint />
          </ActionIcon>

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleShape()} variant="subtle">
            <IconRosette />
          </ActionIcon>

          <ActionIcon style={{ pointerEvents: 'auto' }} onClick={() => handleLine()} variant="subtle">
            <IconTimeline />
          </ActionIcon>
        </Group>


        <ActionIcon
          variant="subtle"
          style={{ pointerEvents: 'auto', opacity: 1 }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            dispatch(removeEmbedding({ id: model.id }));
          }}
        >
          <IconX />
        </ActionIcon>


      </Group>

      <LabelsOverlay labels={model.labels} />
    </Group>
  );
}
