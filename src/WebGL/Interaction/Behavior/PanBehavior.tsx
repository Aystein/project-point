import {
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DRAGGING,
} from '../../Interaction/Commands';
import { useMouseEvent } from './useMouseDrag';
import { useVisContext } from '../../VisualizationContext';
import { useAppSelector } from '../../../Store/hooks';
import { Affix } from '@mantine/core';

export function PanBehavior({ button = 0 }: { button?: number }) {
  const { setZoom } = useVisContext();
  const activeTool = useAppSelector((state) => state.views.selectedTool);

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
    [setZoom, activeTool]
  );

  return activeTool === 'pan' ? <Affix zIndex={100} style={{ width: '100%', height: '100%', cursor: 'grab' }} /> : null;
}
