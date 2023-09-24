import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DRAGGING,
} from '../../Interaction/Commands';
import { useMouseEvent } from './useMouseDrag';
import { useVisContext } from '../../VisualizationContext';
import { useAppSelector } from '../../../Store/hooks';

export function PanBehavior({ button = 0 }: { button?: number }) {
  const { setZoom } = useVisContext();
  const activeTool = useAppSelector((state) => state.settings.activeTool)

  useMouseEvent(
    MOUSE_DRAGGING,
    (event) => {
      if (event.button === button && activeTool === 'pan') {
        setZoom((zoom) => ({
          ...zoom,
          tx: zoom.tx + event.movementX,
          ty: zoom.ty + event.movementY,
        }));

        return true;
      }
    },
    COMMAND_PRIORITY_NORMAL,
    [setZoom]
  );

  return null;
}
