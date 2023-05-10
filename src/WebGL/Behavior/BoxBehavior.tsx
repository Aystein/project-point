import * as React from 'react'
import {
  LexicalCommand,
  CommandListener,
  MOUSE_DRAG,
  MOUSE_DRAGGING,
  MOUSE_DRAG_END,
} from '../Commands'
import { useVisContext } from '../VisualizationContext'
import { Rectangle } from '../Math/Rectangle'
import { Button } from '@mantine/core'
import { TSNE } from '../../MainTabs/tSNE'
import { SpatialModel } from '../../Store/ModelSlice'

function ProjectButton({ area, model }: { area: Rectangle, model: SpatialModel }) {
  const [open, setOpen] = React.useState(false)
  

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <Button
        style={{ pointerEvents: 'auto', opacity: 1 }}
        m="1.5rem"
        variant="outline"
        onClick={handleOpen}
      >
        Settings
      </Button>
      <TSNE open={open} setOpen={setOpen} />
    </>
  )
}

export function useMouseEvent<T>(
  command: LexicalCommand<T>,
  callback: CommandListener<T>,
  deps: React.DependencyList
) {
  const { vis } = useVisContext()

  React.useEffect(() => {
    return vis.registerCommand(command, callback, 1)
  }, deps)
}

export function BoxBehavior() {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext()

  const [rect, setRect] = React.useState<Rectangle>()

  const [models, setModels] = React.useState<Rectangle[]>([])

  // register to mousedrag...
  useMouseEvent(
    MOUSE_DRAG,
    (event) => {
      if (event.button === 2) {
        setRect(new Rectangle(event.offsetX, event.offsetY, 0, 0))
        return true
      }

      return false
    },
    []
  )

  useMouseEvent(
    MOUSE_DRAGGING,
    (event) => {
      if (rect && event.button === 2) {
        setRect((value) => {
          return new Rectangle(
            value.x,
            value.y,
            event.offsetX - value.x,
            event.offsetY - value.y
          )
        })
        return true
      }

      return false
    },
    [rect, setRect]
  )

  useMouseEvent(
    MOUSE_DRAG_END,
    (event) => {
      if (rect) {
        setModels((arr) => {
          return [
            ...arr,
            new Rectangle(
              scaledXDomain.invert(rect.x),
              scaledYDomain.invert(rect.y),
              scaledXDomain.invert(rect.x + rect.width) -
                scaledXDomain.invert(rect.x),
              scaledYDomain.invert(rect.y + rect.height) -
                scaledYDomain.invert(rect.y)
            ),
          ]
        })
        setRect(null)
        return true
      }
      return false
    },
    [rect]
  )

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {rect ? (
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            border: '1px solid black',
            borderRadius: '0.25rem',
          }}
        />
      ) : null}

      {models.map((area) => {
        return (
          <div
            key={area.x}
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: scaledXDomain(area.x),
              top: scaledYDomain(area.y),
              width:
                scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
              height:
                scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
              border: '3px solid black',
            }}
          >
            <ProjectButton area={area} model={model} />
          </div>
        )
      })}
    </div>
  )
}
