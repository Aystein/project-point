import { Box } from '@mantine/core';
import {
  changeSize,
  rerunLayouts,
  activateModel,
  translateArea,
} from '../../../Store/ViewSlice';
import { useAppDispatch } from '../../../Store/hooks';
import { SpatialModel } from '../../../Store/interfaces';
import { useVisContext } from '../../VisualizationContext';
import { IconDragCover } from './DragCover';
import classes from './Handles.module.css';

export function MoveHandles({ model }: { model: SpatialModel }) {
  const dispatch = useAppDispatch();
  const { world } = useVisContext();

  return [
    classes.leftHandle,
    classes.rightHandle,
    classes.bottomHandle,
    classes.topHandle,
  ].map((cls) => {
    return (
      <IconDragCover
        key={cls}
        onMouseDown={() => dispatch(activateModel({ id: model.id }))}
        onMouseMove={(event) =>
          dispatch(
            translateArea({
              id: model.id,
              x: world(event.movementX),
              y: world(event.movementY),
            })
          )
        }
        cursor="move"
        icon={
          <Box
            className={cls}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />
    );
  });
}

export function Handles({ model }: { model: SpatialModel }) {
  const dispatch = useAppDispatch();
  const { world } = useVisContext();

  return (
    <>
      {/* top left */}
      <IconDragCover
        onMouseMove={(event) => {
          const { movementX, movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x + world(movementX),
                y: model.area.y + world(movementY),
                width: model.area.width - world(movementX),
                height: model.area.height - world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="nwse-resize"
        icon={<Box className={classes.topLeftHandle} data-interaction />}
      />
      {/* bottom right */}
      <IconDragCover
        onMouseMove={(event) => {
          const { movementX, movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x,
                y: model.area.y,
                width: model.area.width + world(movementX),
                height: model.area.height + world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="nwse-resize"
        icon={
          <Box
            className={classes.bottomRightHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />
      {/* top right */}
      <IconDragCover
        onMouseMove={(event) => {
          const { movementX, movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x,
                y: model.area.y + world(movementY),
                width: model.area.width + world(movementX),
                height: model.area.height - world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="nesw-resize"
        icon={
          <Box
            className={classes.topRightHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />
      {/* bottom left */}
      <IconDragCover
        onMouseMove={(event) => {
          const { movementX, movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x + world(movementX),
                y: model.area.y,
                width: model.area.width - world(movementX),
                height: model.area.height + world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="nesw-resize"
        icon={
          <Box
            className={classes.bottomLeftHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />
      {/* middle left */}
      <IconDragCover
        onMouseMove={(event) => {
          const { movementX } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x + world(movementX),
                y: model.area.y,
                width: model.area.width - world(movementX),
                height: model.area.height,
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="ew-resize"
        icon={
          <Box
            className={classes.middleLeftHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />

      <IconDragCover
        onMouseMove={(event) => {
          const { movementX } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x,
                y: model.area.y,
                width: model.area.width + world(movementX),
                height: model.area.height,
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="ew-resize"
        icon={
          <Box
            className={classes.middleRightHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />

      <IconDragCover
        onMouseMove={(event) => {
          const { movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x,
                y: model.area.y + world(movementY),
                width: model.area.width,
                height: model.area.height - world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="ns-resize"
        icon={
          <Box
            className={classes.middleTopHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />

      <IconDragCover
        onMouseMove={(event) => {
          const { movementY } = event;

          dispatch(
            changeSize({
              id: model.id,
              newArea: {
                x: model.area.x,
                y: model.area.y,
                width: model.area.width,
                height: model.area.height + world(movementY),
              },
            })
          );
        }}
        onMouseUp={() => {
          dispatch(rerunLayouts({ id: model.id }));
        }}
        cursor="ns-resize"
        icon={
          <Box
            className={classes.middleBottomHandle}
            data-interaction
            onClick={() => dispatch(activateModel({ id: model.id }))}
          />
        }
      />
    </>
  );
}
