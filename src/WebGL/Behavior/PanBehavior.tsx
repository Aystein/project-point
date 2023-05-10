import { MOUSE_DRAGGING } from '../Commands'
import { useMouseDrag } from './LassoBehavior'
import { useVisContext } from '../VisualizationContext'

export function PanBehavior({ button = 0 }: { button?: number }) {
  const { setZoom } = useVisContext()

  useMouseDrag(
    MOUSE_DRAGGING,
    (event) => {
      console.log(event.button)

      if (event.button === button) {
        setZoom((zoom) => ({
          ...zoom,
          tx: zoom.tx + event.movementX,
          ty: zoom.ty + event.movementY,
        }))

        return true
      }
    },
    [setZoom]
  )

  return null
}
