import { useElementSize } from '@mantine/hooks';
import * as React from 'react';
import { createContext, useContext } from 'react';
import { WebGLRenderer } from 'three';
import {
  MOUSE_LEAVE,
  MOUSE_DRAG_START,
  MOUSE_DRAGGING,
  MOUSE_UP,
  MOUSE_HOVER,
  MOUSE_WHEEL,
  MOUSE_DRAG_END,
  MOUSE_DOWN,
  MOUSE_CONTEXT,
} from './Interaction/Commands';
import { MouseController } from './Interaction/MouseController';
import { Visualization } from './Visualization';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { ZoomTransform } from './Math/ZoomTransform';
import { useMantineTheme } from '@mantine/core';
import { Engine } from '../ts/engine/engine';

export const VisContext = createContext<{
  vis: Visualization;
  ref;
  registerRenderFunction: (value) => void;
  xDomain: number[];
  yDomain: number[];
  width: number;
  height: number;
  zoom: { tx: number; ty: number; s: number };
  setZoom: (
    zoom: React.SetStateAction<{ tx: number; ty: number; s: number }>
  ) => void;
  scaledXDomain: ScaleLinear<number, number>;
  scaledYDomain: ScaleLinear<number, number>;
  world: (value: number) => number;
}>(null);

export const VisProvider = ({ children, defaultZoom, defaultXDomain }: { defaultZoom?, children, defaultXDomain?: number[] }) => {
  const [zoom, setZoom] = React.useState(
    defaultZoom ?? {
      tx: 0,
      ty: 0,
      s: 1,
    }
  );

  const { ref, width, height } = useElementSize();
  const [renderer, setRenderer] = React.useState<WebGLRenderer>();

  const [renderFunctions, setRenderFunctions] = React.useState([]);

  const [xDomain, setXDomain] = React.useState(defaultXDomain ?? [Engine.board_size / 2 - 5, Engine.board_size / 2 + 5]);

  const yDomain = React.useMemo(() => {
    const halfExtent = ((xDomain[1] - xDomain[0]) * (height / width)) / 2;
    const centerY = (xDomain[1] + xDomain[0]) / 2;

    return [centerY - halfExtent, centerY + halfExtent];
  }, [xDomain, width, height]);

  const scaledXDomain = React.useMemo(() => {
    const xScale = scaleLinear().domain(xDomain).range([0, width]);

    const zoomTransform = new ZoomTransform(zoom.s, zoom.tx, zoom.ty);
    const newX = zoomTransform.rescaleX(xScale);

    return newX;
  }, [xDomain, zoom, width]);

  const scaledYDomain = React.useMemo(() => {
    const yScale = scaleLinear().domain(yDomain).range([0, height]);

    const zoomTransform = new ZoomTransform(zoom.s, zoom.tx, zoom.ty);
    const newY = zoomTransform.rescaleY(yScale);

    return newY;
  }, [yDomain, zoom, height]);

  const world = React.useMemo(() => {
    return (value: number) => {
      const pxPerWorld =
        width / (scaledXDomain.domain()[1] - scaledXDomain.domain()[0]);
      return value / pxPerWorld;
    };
  }, [scaledXDomain, width]);

  renderer?.setSize(width, height, false);

  const registerRenderFunction = (value) => {
    setRenderFunctions([...renderFunctions, value]);
  };

  const visContext = React.useMemo(() => {
    return new Visualization();
  }, []);

  const mcontroller = React.useMemo(() => {
    const controller = new MouseController();

    controller.onMouseLeave = (event) =>
      visContext.dispatchCommand(MOUSE_LEAVE, event);

    controller.onMouseMove = (event) => {
      visContext.dispatchCommand(MOUSE_HOVER, event);
    };
    controller.onMouseUp = (event) =>
      visContext.dispatchCommand(MOUSE_UP, event);

    controller.onDragStart = (event) => {
      visContext.dispatchCommand(MOUSE_DRAG_START, event);
    };
    controller.onDragMove = (event) => {
      visContext.dispatchCommand(MOUSE_DRAGGING, event);
    };
    controller.onDragEnd = (event) => {
      visContext.dispatchCommand(MOUSE_DRAG_END, event);
    };
    controller.onMouseDown = (event) => {
      return visContext.dispatchCommand(MOUSE_DOWN, event);
    };
    controller.onContext = (event) => {
      visContext.dispatchCommand(MOUSE_CONTEXT, event);
    };
    controller.onMouseWheel = (event) => {
      visContext.dispatchCommand(MOUSE_WHEEL, event);
    };

    return controller;
  }, [visContext]);

  const checkTarget = (target: HTMLElement) => {
    if (target.tagName.toLowerCase() !== 'div') {
      return false;
    }
    if (target.hasAttribute('data-interaction')) {
      return false
    }
    return true
  }

  return (
    <VisContext.Provider
      value={{
        width,
        height,
        registerRenderFunction,
        xDomain: xDomain,
        yDomain: [0, 50],
        ref,
        vis: visContext,
        zoom,
        setZoom,
        scaledXDomain,
        scaledYDomain,
        world,
      }}
    >
      <div
        style={{ width: '100%', height: '100%' }}
        ref={ref}
        onMouseDown={(event) => {
          if (!checkTarget(event.target as HTMLElement)) {
            return;
          }
          
          mcontroller.mouseDown(event.nativeEvent);
        }}
        onMouseUp={(event) => {
          if (!checkTarget(event.target as HTMLElement)) {
            return;
          }

          mcontroller.mouseUp(event.nativeEvent);
        }}
        onMouseMove={(event) => {
          
          if (!checkTarget(event.target as HTMLElement)) {
            return;
          }
          
          mcontroller.mouseMove(ref.current, event.nativeEvent);
        }}
        onWheel={(event) => {
          mcontroller.mouseWheel(event.nativeEvent);
        }}
      >
        {children}
      </div>
    </VisContext.Provider>
  );
};

export function useVisContext() {
  const visContext = useContext(VisContext);

  if (visContext == null) {
    console.error('VisContext.useVisContext: cannot find a VisContext');
  }

  return visContext;
}
