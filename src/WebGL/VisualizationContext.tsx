import { useElementSize } from "@mantine/hooks";
import * as React from "react";
import { createContext, useContext } from "react";
import { WebGLRenderer } from "three";
import { MOUSE_LEAVE, MOUSE_MOVE, MOUSE_DRAG, MOUSE_DRAGGING, MOUSE_UP } from "./Commands";
import { MouseController } from "./MouseController";
import { Visualization } from "./Visualization";

const VisContext = createContext({
   vis: undefined as Visualization,
   ref: undefined,
   requestFrame: undefined,
   registerRenderFunction: undefined,
   xDomain: [0, 50],
   yDomain: [0, 50],
   width: 600,
   height: 400,
});

export const VisProvider = ({ children }) => {
   const [dimensions, setDimensions] = React.useState({
      width: 600,
      height: 400,
   });

   const { ref, width, height } = useElementSize();
   const [renderer, setRenderer] = React.useState<WebGLRenderer>();

   const [renderFunctions, setRenderFunctions] = React.useState([]);

   renderer?.setSize(width, height, false);

   const dirtyRef = React.useRef(false);

   const frame = () => {
      console.log("doing frame" + renderFunctions.length);
      renderFunctions.forEach((func) => {
         func(renderer);
      });

      dirtyRef.current = false;
   };

   const frameRef = React.useRef(frame);
   frameRef.current = frame;

   const requestFrame = () => {
      if (!dirtyRef.current) {
         requestAnimationFrame(() => frameRef.current());

         dirtyRef.current = true;
      }
   };

   React.useEffect(() => {
      requestFrame();
   }, [width, height]);

   const registerRenderFunction = (value) => {
      setRenderFunctions([...renderFunctions, value]);
   };

   React.useEffect(() => {
      const renderer = new WebGLRenderer({ canvas: ref.current });
      renderer.setPixelRatio(window.devicePixelRatio);
      setRenderer(renderer);
   }, []);

   const vis = undefined;

   const visContext = React.useMemo(() => {
      return new Visualization();
   }, []);

   React.useEffect(() => {
      const controller = new MouseController();

      controller.onMouseLeave = (event) => visContext.dispatchCommand(MOUSE_LEAVE, event);
      controller.onMouseMove = (event) => visContext.dispatchCommand(MOUSE_MOVE, event);
      controller.onMouseUp = (event) => visContext.dispatchCommand(MOUSE_UP, event);

      controller.onDragStart = (event) => visContext.dispatchCommand(MOUSE_DRAG, event);
      controller.onDragMove = (event) => visContext.dispatchCommand(MOUSE_DRAGGING, event);

      controller.attach(ref.current);

      return () => {
         if (ref.current) {
            controller.detach();
         }
      };
   }, [visContext, ref]);

   return (
      <VisContext.Provider
         value={{
            ...dimensions,
            requestFrame,
            registerRenderFunction,
            xDomain: [0, 50],
            yDomain: [0, 50],
            ref,
            vis: visContext,
         }}
      >
         <canvas
            style={{ width: "100%", height: "100%" }}
            width={dimensions.width}
            height={dimensions.height}
            ref={ref}
         ></canvas>
         {children}
      </VisContext.Provider>
   );
};

export function useVisContext() {
   const visContext = useContext(VisContext);

   if (visContext == null) {
      console.error("VisContext.useVisContext: cannot find a VisContext");
   }

   return visContext;
}
