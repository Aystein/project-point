import { useElementSize } from "@mantine/hooks";
import * as React from "react";
import { createContext, useContext } from "react";
import { WebGLRenderer } from "three";

const VisContext = createContext({ ref: undefined, registerRenderFunction: undefined, xDomain: [0, 50], yDomain: [0, 50], width: 600, height: 400 });
 
export const VisProvider = ({ children }) => {
 const [dimensions, setDimensions] = React.useState({ width: 600, height: 400 });
 
 const { ref, width, height } = useElementSize();
 const [renderer, setRenderer] = React.useState<WebGLRenderer>();

 const [renderFunctions, setRenderFunctions] = React.useState([]);

 const registerRenderFunction = (value) => {
    setRenderFunctions([...renderFunctions, value])
 }

 const frame = () => {
    renderFunctions.forEach((func) => {
        func(renderer);
    })
 }

 const dirtyRef = React.useRef(false);

 const requestFrame = () => {
    if (!dirtyRef.current) {
        requestAnimationFrame(frame);
    
        dirtyRef.current = true;
    }
 }

 React.useEffect(() => {
    setRenderer(new WebGLRenderer(ref.current));
  }, []);

 return (
   <VisContext.Provider value={{ ...dimensions, registerRenderFunction, xDomain: [0, 50], yDomain: [0, 50], ref }}>
        <canvas
        style={{ width: "100%", height: "100%" }}
        width={dimensions.width}
        height={dimensions.height}
        ref={ref}
      >
      </canvas>
     {children}
   </VisContext.Provider>
 );
};
 
export const useVisContext = () => useContext(VisContext);