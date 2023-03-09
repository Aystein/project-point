import { MOUSE_DRAGGING } from "../Commands";
import { useMouseDrag } from "./LassoBehavior";
import { useVisContext } from "../VisualizationContext";

export function PanBehavior() {
    const { setZoom } = useVisContext();

    useMouseDrag(
        MOUSE_DRAGGING,
        (event) => {
            setZoom((zoom) => ({
                ...zoom,
                tx: zoom.tx + event.movementX,
                ty: zoom.ty + event.movementY
            }));

            return true;
        },
        [setZoom]
    );

    return null;
}