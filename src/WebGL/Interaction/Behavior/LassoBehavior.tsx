import * as React from 'react';
import { useVisContext } from '../../VisualizationContext';
import { SimpleDragCover } from './DragCover';
import { useMouseEvent } from './useMouseDrag';
import {
  COMMAND_PRIORITY_CRITICAL,
  MOUSE_DOWN,
  MOUSE_DRAGGING,
} from '../Commands';
import {
  setHover,
  setSelection,
  updatePositionByFilter,
} from '../../../Store/ViewSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../Store/hooks';
import { pointInPolygon } from '../../../Util';
import { VectorLike } from '../../../Interfaces';
import { runCondenseLayout } from '../../../Layouts/Layouts';

export function lassoPath(lasso) {
  return (lasso ?? []).reduce((svg, [x, y], i) => {
    return (svg +=
      i == 0 ? `M ${x},${y} ` : i === lasso.length - 1 ? ' Z' : `L ${x},${y} `);
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

function isInside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function LassoSelectionPlugin() {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext();

  const [drag, setDrag] = React.useState<VectorLike>(null);
  const dispatch = useDispatch();
  const spatial = useAppSelector((state) => state.views.positions);

  const [points, setPoints] = React.useState<[number, number][]>([]);

  const ref = React.useRef(null);

  const selection = useAppSelector((state) => state.views.selection);

  useMouseEvent(
    MOUSE_DOWN,
    (event) => {
      if (event.button === 0) {
        setDrag({ x: event.offsetX, y: event.offsetY });
        dispatch(setHover([]));

        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_CRITICAL,
    []
  );

  const handleCondense = async (position: VectorLike) => {
    const Y = await runCondenseLayout(selection.length, {
      x: scaledXDomain.invert(position.x) - 2,
      y: scaledYDomain.invert(position.y) - 2,
      width: 4,
      height: 4,
    });

    dispatch(updatePositionByFilter({ filter: selection, position: Y }));
  };

  return (
    <>
      <svg
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'all',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        ref={ref}
      >
        {drag ? (
          <path fill="rgba(1,1,1,0.1)" stroke="black" d={lassoPath(points)} />
        ) : null}
      </svg>
      <SimpleDragCover
        boxRef={ref}
        onClick={(position) => {
          handleCondense(position);

          setDrag(null);
        }}
        onMove={(_, event) => {
          const bound = ref.current.getBoundingClientRect();
          const x = event.offsetX - bound.x;
          const y = event.offsetY - bound.y;
          if (
            points.length === 0 ||
            distance(points[points.length - 1], [x, y]) > 5
          ) {
            setPoints((old) => [...old, [x, y]]);
          }
        }}
        drag={drag}
        setDrag={() => {
          const worldPoints = points.map((point) => [
            scaledXDomain.invert(point[0]),
            scaledYDomain.invert(point[1]),
          ]) as [number, number][];
          let indices = new Array<number>();

          spatial.forEach((xy, i) => {
            if (pointInPolygon(xy.x, xy.y, worldPoints)) {
              indices.push(i);
            }
          });

          dispatch(setSelection(indices));

          setDrag(null);
          setPoints([]);
        }}
      />
    </>
  );
}
