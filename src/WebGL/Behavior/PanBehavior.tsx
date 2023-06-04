import { COMMAND_PRIORITY_NORMAL, MOUSE_DRAGGING } from '../Commands'
import { useMouseDrag } from "./useMouseDrag"
import { useVisContext } from '../VisualizationContext'

export function PanBehavior({ button = 0 }: { button?: number }) {
  const { setZoom } = useVisContext()

  useMouseDrag(
    MOUSE_DRAGGING,
    (event) => {
      if (event.button === button) {
        setZoom((zoom) => ({
          ...zoom,
          tx: zoom.tx + event.movementX,
          ty: zoom.ty + event.movementY,
        }))

        return true
      }
    },
    COMMAND_PRIORITY_NORMAL,
    [setZoom]
  )

  return null
}
