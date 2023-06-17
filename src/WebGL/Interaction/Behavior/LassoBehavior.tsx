import * as React from 'react'
import { COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_NORMAL, MOUSE_DRAG, MOUSE_DRAGGING, MOUSE_DRAG_END } from '../../Interaction/Commands'
import { useVisContext } from '../../VisualizationContext'
import { useMouseEvent } from './useMouseDrag'

export function LassoSelectionPlugin() {
  const { vis } = useVisContext()

  const [points, setPoints] = React.useState<{ x: number; y: number }[]>([])

  return <svg style={{ pointerEvents: 'none' }}></svg>
}
