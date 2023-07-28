import React from 'react';
import { VectorLike } from '../../../Interfaces';
import { ActionIcon, Affix } from '@mantine/core';
import { distanceXY } from './LassoBehavior';

export function SimpleDragCover({
  onMove,
  onClick,
  boxRef,
  drag,
  setDrag,
  icon,
  style,
}: {
  onMove: (amount: VectorLike, event: MouseEvent) => void;
  onClick?: (position: VectorLike) => void;
  boxRef?: React.RefObject<HTMLElement>;
  drag: VectorLike;
  setDrag: (value: VectorLike) => void;
  icon?: JSX.Element;
  style?;
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

            if (!dragRef.current && distanceXY(pos, drag) > 2) {
              dragRef.current = true;
            }

            if (dragRef.current) {
              onMove(
                { x: event.movementX, y: event.movementY },
                event.nativeEvent
              );
            }
          }}
          onMouseUp={(event) => {
            event.stopPropagation();
            event.preventDefault();

            setDrag(null);

            if (!dragRef.current) {
              if (onClick) {
                onClick(translate(event));
              }
            }
            dragRef.current = false;
          }}
        />
      ) : null}

      {icon ? (
        <ActionIcon
          size="sm"
          style={style}
          onMouseDown={(event) => {
            //event.preventDefault();
            //event.stopPropagation();

            setDrag({ x: event.screenX, y: event.screenY });
          }}
          onContextMenu={(event) => {
            event.preventDefault();
          }}
        >
          {icon}
        </ActionIcon>
      ) : null}
    </>
  );
}
