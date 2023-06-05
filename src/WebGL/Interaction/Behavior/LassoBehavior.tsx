import * as React from 'react'
import { COMMAND_PRIORITY_NORMAL, MOUSE_DRAG, MOUSE_DRAGGING, MOUSE_DRAG_END } from '../../Interaction/Commands'
import { useVisContext } from '../../VisualizationContext'
import { useMouseEvent } from './useMouseDrag'

export function LassoSelectionPlugin() {
  const { vis } = useVisContext()

  const [points, setPoints] = React.useState<{ x: number; y: number }[]>([])

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DRAG,
    (event) => {
      setPoints([...points, { x: event.offsetX, y: event.offsetY }])
      return false
    },
    COMMAND_PRIORITY_NORMAL,
    []
  )

  useMouseEvent(
    MOUSE_DRAGGING,
    (event) => {
      // setPoints([...points, { x: event.offsetX, y: event.offsetY }]);
      return false
    },
    COMMAND_PRIORITY_NORMAL,
    []
  )

  useMouseEvent(
    MOUSE_DRAG_END,
    (event) => {
      setPoints([...points, { x: event.offsetX, y: event.offsetY }])
      return false
    },
    COMMAND_PRIORITY_NORMAL,
    []
  )

  return <svg style={{ pointerEvents: 'none' }}></svg>
}
