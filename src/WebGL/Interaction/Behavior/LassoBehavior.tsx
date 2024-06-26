import * as React from 'react';
import { useDispatch } from 'react-redux';
import { VectorLike } from '../../../Interfaces';
import { fillOperation } from '../../../Layouts/Layouts';
import {
  activateModel,
  rerunLayouts,
  setHover,
  setSelection,
  transfer,
  updatePositionByFilter,
} from '../../../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../../../Store/hooks';
import { Rectangle } from '../../Math/Rectangle';
import { useVisContext } from '../../VisualizationContext';
import { COMMAND_PRIORITY_CRITICAL, MOUSE_DOWN } from '../Commands';
import { SimpleDragCover } from './DragCover';
import { useMouseEvent } from './useMouseDrag';
import { pointInPolygon } from '../../../Util';
import { selectActiveModel, selectAllModels } from '../../../Store/Selectors';
import { flushSync } from 'react-dom';
import { EntityId } from '@reduxjs/toolkit';

export function lassoPath(lasso) {
  return (lasso ?? []).reduce((svg, [x, y], i) => {
    return (svg += i === 0 ? `M ${x},${y}` : `L ${x},${y} `);
  }, '');
}

export function distance(p1, p2) {
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  var a = x1 - x2;
  var b = y1 - y2;

  var c = Math.sqrt(a * a + b * b);
  return c;
}

export function distanceXY(p1: VectorLike, p2: VectorLike) {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;
  var a = x1 - x2;
  var b = y1 - y2;

  var c = Math.sqrt(a * a + b * b);
  return c;
}

function useAnimationFrame(callback) {
  const functionRef = React.useRef(callback);
  functionRef.current = callback;

  const dirtyRef = React.useRef(false);

  return {
    request: (args) => {
      if (!dirtyRef.current) {
        dirtyRef.current = true;
      }
      requestAnimationFrame(() => {
        dirtyRef.current = false;
        functionRef.current(args);
      });
    },
  };
}

export function LassoSelectionPlugin() {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext();

  const [drag, setDrag] = React.useState<VectorLike>(null);
  const dispatch = useAppDispatch();
  const spatial = useAppSelector((state) => state.views.present.positions);
  const globalFilter = useAppSelector((state) => state.views.present.filter);

  const [ripple, setRipple] = React.useState<VectorLike>();

  const [points, setPoints] = React.useState<[number, number][]>([]);

  const ref = React.useRef(null);
  const activeTool = useAppSelector((state) => state.views.present.selectedTool);

  const selection = useAppSelector((state) => state.views.present.selection);
  const localSelection = useAppSelector((state) => state.views.present.localSelection);
  const activeModel = useAppSelector(selectActiveModel);

  const models = useAppSelector(selectAllModels)

  const { request } = useAnimationFrame(([x, y]) => {
    if (drag) {
      flushSync(() => {
        setPoints((old) => [...old, [x, y]]);
      });
    }
  })

  useMouseEvent(
    MOUSE_DOWN,
    (event) => {
      if (event.button === 0 && activeTool === 'select') {
        setDrag({ x: event.offsetX, y: event.offsetY });
        dispatch(setHover([]));
        // dispatch(activateModel({ id: undefined }))
        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
    [activeTool]
  );

  const handleCondense = async (position: VectorLike, target: EntityId) => {
    if (!selection || selection.length === 0) return;

    const cx = scaledXDomain.invert(position.x);
    const cy = scaledYDomain.invert(position.y);

    const { Y } = await fillOperation({
      N: selection.length,
      area: { x: cx - 10, y: cy - 10, width: 20, height: 20 },
    });

    dispatch(transfer({ globalIds: selection, target }));

    if (!target) {
      dispatch(updatePositionByFilter({ filter: localSelection, position: Y }));
    }
  };

  return (
    <>
      <svg
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none',
          top: 0,
          left: 0,
        }}
        ref={ref}
      >
        {drag ? (
          <path
            fill="rgba(1,1,1,0.1)"
            stroke="black"
            stroke-dasharray="4 4"
            d={lassoPath(points)}
          />
        ) : null}
      </svg>
      <SimpleDragCover
        boxRef={ref}
        onClick={(position) => {
          const x = scaledXDomain.invert(position.x);
          const y = scaledYDomain.invert(position.y);

          setRipple(position);
          setDrag(null);
          setPoints([]);

          let target: EntityId = null;

          for (let i = models.length - 1; i >= 0; i--) {
            const model = models[i];

            if (Rectangle.deserialize(model.area).within({ x, y })) {
              dispatch(activateModel({ id: model.id }));

              target = model.id;
              break;
            }
          }

          handleCondense(position, target);
        }}
        onDrag={(_, event) => {
          const bound = ref.current.getBoundingClientRect();
          const x = event.offsetX - bound.x;
          const y = event.offsetY - bound.y;

          if (points.length === 0) {

            setPoints([[x, y]])
          } else if (distance(points[points.length - 1], [x, y]) > 8) {
            request([x, y]);
          }
        }}
        drag={drag}
        onDragEnd={(val, modifier) => {
          const worldPoints = points.map((point) => [
            scaledXDomain.invert(point[0]),
            scaledYDomain.invert(point[1]),
          ]) as [number, number][];

          const minX = Math.min(...worldPoints.map((point) => point[0]));
          const minY = Math.min(...worldPoints.map((point) => point[1]));
          const maxX = Math.max(...worldPoints.map((point) => point[0]));
          const maxY = Math.max(...worldPoints.map((point) => point[1]));
          let box = new Rectangle(
            minX,
            minY,
            minX + (maxX - minX),
            minY + (maxY - minY)
          );

          let indices = new Array<number>();

          spatial.forEach((xy, i) => {
            if (box.within(xy) && pointInPolygon(xy.x, xy.y, worldPoints)) {
              indices.push(globalFilter[i]);
            }
          });

          if (modifier) {
            const mergedSelection = new Set([...selection, ...indices]);
            dispatch(setSelection(Array.from(mergedSelection)))
          } else {
            dispatch(setSelection(indices.length === 0 ? undefined : indices));
          }

          setDrag(null);
          setPoints([]);
        }}
      />
    </>
  );
}
