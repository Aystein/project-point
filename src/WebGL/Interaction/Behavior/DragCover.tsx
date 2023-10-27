import React from 'react';
import { VectorLike } from '../../../Interfaces';
import { ActionIcon, Affix } from '@mantine/core';
import { distanceXY } from './LassoBehavior';

export function SimpleDragCover({
  onDrag,
  onClick,
  boxRef,
  drag,
  onDragEnd,
}: {
  onDrag: (amount: VectorLike, event: MouseEvent) => void;
  onClick?: (position: VectorLike) => void;
  boxRef?: React.RefObject<HTMLElement>;
  drag: VectorLike;
  onDragEnd: (value: VectorLike) => void;
}) {
  const dragRef = React.useRef(false);

  const translate = (event: React.MouseEvent) => {
    const box = boxRef?.current.getBoundingClientRect() ?? { x: 0, y: 0 };

    return {
      x: event.nativeEvent.offsetX - box.x,
      y: event.nativeEvent.offsetY - box.y,
    };
  };

  return (
    <>
      {drag ? (
        <Affix
          style={{ pointerEvents: 'initial', width: '100%', height: '100%' }}
          opacity={0.5}
          data-interaction
          onMouseMove={(event) => {
            event.stopPropagation();
            event.preventDefault();

            const pos = translate(event);

            if (!dragRef.current && distanceXY(pos, drag) > 4) {
              dragRef.current = true;
            }

            if (dragRef.current) {
              onDrag(
                { x: event.movementX, y: event.movementY },
                event.nativeEvent
              );
            }
          }}
          onMouseUp={(event) => {
            event.stopPropagation();
            event.preventDefault();

            const pos = translate(event);

            if (dragRef.current) {
              onDragEnd(null);
            }

            if (!dragRef.current) {
              if (onClick) {
                onClick(translate(event));
              }
            }
            dragRef.current = false;
          }}
        />
      ) : null}
    </>
  );
}


export function IconDragCover({
  icon,
  onClick,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  cursor,
}: {
  icon?: JSX.Element;
  onClick?: () => void;
  onMouseMove?: (event: { movementX: number, movementY: number }) => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  cursor?: string,
}) {
  const dragRef = React.useRef<{ x: number; y: number }>();
  const [drag, setDrag] = React.useState(false);
  const [isClick, setIsClick] = React.useState(true);

  return (
    <>
      {drag ? (
        <Affix
          style={{ pointerEvents: 'initial', width: '100%', height: '100%', cursor }}
          data-interaction
          onMouseMove={(event) => {
            event.stopPropagation();
            event.preventDefault();

            const { screenX, screenY } = event.nativeEvent;

            if (isClick && distanceXY(dragRef.current, { x: screenX, y: screenY }) > 4) {
              setIsClick(false);
              onMouseMove({ movementX: screenX - dragRef.current.x, movementY: screenY - dragRef.current.y });
              dragRef.current = { x: screenX, y: screenY };
            }

            if (!isClick) {
              onMouseMove({ movementX: screenX - dragRef.current.x, movementY: screenY - dragRef.current.y });
              dragRef.current = { x: screenX, y: screenY };
            }
          }}
          onMouseUp={(event) => {
            event.stopPropagation();
            event.preventDefault();

            if (isClick && onClick) {
              onClick();
            }

            if (!isClick && onMouseUp) {
              onMouseUp();
            }

            dragRef.current = null;
            setDrag(false);
            setIsClick(true);
          }}
        />
      ) : null}

      { React.cloneElement(icon, { onMouseDown: (event) => {
        dragRef.current = { x: event.screenX, y: event.screenY };
        setDrag(true);
        
        if (onMouseDown) onMouseDown();
      } }) }
    </>
  );
}
