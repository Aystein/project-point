import * as React from 'react'
import {
  LexicalCommand,
  CommandListener,
  MOUSE_DRAG,
  MOUSE_DRAGGING,
  MOUSE_DRAG_END,
} from '../Commands'
import { useVisContext } from '../VisualizationContext'

export function useMouseDrag<T>(
  command: LexicalCommand<T>,
  callback: CommandListener<T>,
  deps: React.DependencyList
) {
  const { vis } = useVisContext()

  React.useEffect(() => {
    return vis.registerCommand(command, callback, 1)
  }, deps)
}

export function LassoSelectionPlugin() {
  const { vis } = useVisContext()

  const [points, setPoints] = React.useState<{ x: number; y: number }[]>([])

  // register to mousedrag...
  useMouseDrag(
    MOUSE_DRAG,
    (event) => {
      setPoints([...points, { x: event.offsetX, y: event.offsetY }])
      return false
    },
    []
  )

  useMouseDrag(
    MOUSE_DRAGGING,
    (event) => {
      // setPoints([...points, { x: event.offsetX, y: event.offsetY }]);
      return false
    },
    []
  )

  useMouseDrag(
    MOUSE_DRAG_END,
    (event) => {
      setPoints([...points, { x: event.offsetX, y: event.offsetY }])
      return false
    },
    []
  )

  return <svg></svg>
}
