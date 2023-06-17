import React from 'react';
import { VectorLike } from '../../../Interfaces';
import { ActionIcon, Overlay } from '@mantine/core';


export function SimpleDragCover({
  onMove,
  onClick,
  style,
  drag,
  setDrag,
}: {
  onMove: (amount: VectorLike) => void;
  onClick: () => void;
  style: React.CSSProperties;
  drag: boolean;
  setDrag: (value: boolean) => void;
}) {
  return (
    <>
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
