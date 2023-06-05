import { COMMAND_PRIORITY_NORMAL, MOUSE_WHEEL } from '../../Interaction/Commands'
import { useMouseEvent } from "./useMouseDrag"
import { useVisContext } from '../../VisualizationContext'

export function normalizeWheel(event) {
  // Reasonable defaults
  const PIXEL_STEP = 10
  const LINE_HEIGHT = 40
  const PAGE_HEIGHT = 800

  let sX = 0
  let sY = 0
  let pX = 0
  let pY = 0

  // Legacy
  if ('detail' in event) {
    sY = event.detail
  }
  if ('wheelDelta' in event) {
    sY = -event.wheelDelta / 120
  }
  if ('wheelDeltaY' in event) {
    sY = -event.wheelDeltaY / 120
  }
  if ('wheelDeltaX' in event) {
    sX = -event.wheelDeltaX / 120
  }

  // side scrolling on FF with DOMMouseScroll
  if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY
    sY = 0
  }

  pX = sX * PIXEL_STEP
  pY = sY * PIXEL_STEP

  if ('deltaY' in event) {
    pY = event.deltaY
  }
  if ('deltaX' in event) {
    pX = event.deltaX
  }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode === 1) {
      // delta in LINE units
      pX *= LINE_HEIGHT
      pY *= LINE_HEIGHT
    } else {
      // delta in PAGE units
      pX *= PAGE_HEIGHT
      pY *= PAGE_HEIGHT
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    sX = pX < 1 ? -1 : 1
  }
  if (pY && !sY) {
    sY = pY < 1 ? -1 : 1
  }

  return {
    spinX: sX,
    spinY: sY,
    pixelX: pX,
    pixelY: pY,
  }
}

export function ZoomBehavior() {
  const { zoom, setZoom, ref } = useVisContext()

  useMouseEvent(
    MOUSE_WHEEL,
    (event) => {
      const evt = normalizeWheel(event)
      const wheel = evt.pixelY < 0 ? 1 : -1

      const zoomFactor = Math.exp(wheel * 0.1)

      // absolute mouse coordinates relative to parent container
      let bounds = ref.current.getBoundingClientRect()
      let x = event.clientX - bounds.left
      let y = event.clientY - bounds.top

      const newScale = Math.max(0.25, Math.min(5.0, zoomFactor * zoom.s))

      // downscaled coordinates relative to anchor
      const zoomPointX = (x - zoom.tx) / zoom.s
      const zoomPointY = (y - zoom.ty) / zoom.s

      const offsetX = -(zoomPointX * (newScale - zoom.s))
      const offsetY = -(zoomPointY * (newScale - zoom.s))

      const newZoom = {
        s: newScale,
        tx: zoom.tx + offsetX,
        ty: zoom.ty + offsetY,
      }

      setZoom(newZoom)

      return true
    },
    COMMAND_PRIORITY_NORMAL,
    [zoom, setZoom, ref]
  )

  return null
}
