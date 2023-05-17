import * as React from 'react'
import { MOUSE_DRAG, MOUSE_DRAGGING, MOUSE_DRAG_END } from '../Commands'
import { useVisContext } from '../VisualizationContext'
import { Rectangle } from '../Math/Rectangle'
import { ActionIcon, Button, Group } from '@mantine/core'
import { SpatialModel } from '../../Store/ModelSlice'
import { openContextModal } from '@mantine/modals'
import { useDispatch } from 'react-redux'
import { VectorLike } from '../../Interfaces'
import {
  addSubEmbedding,
  removeEmbedding,
  updateEmbedding,
} from '../../Store/ViewSlice'
import { IconX } from '@tabler/icons-react'
import { useMouseDrag } from './useMouseDrag'

function ProjectButton({
  filter,
  onFinish,
  onDelete,
}: {
  filter: number[]
  onFinish: (Y: VectorLike[]) => void
  onDelete: () => void
}) {
  return (
    <>
      <Button
        style={{ pointerEvents: 'auto', opacity: 1 }}
        m="1.5rem"
        variant="outline"
        onClick={() => {
          openContextModal({
            modal: 'demonstration',
            title: 't-SNE embedding',
            size: '70%',
            innerProps: {
              filter,
              onFinish,
            },
          })
        }}
      >
        Settings
      </Button>
      <ActionIcon
        style={{ pointerEvents: 'auto', opacity: 1 }}
        onClick={() => {
          onDelete()
        }}
      >
        <IconX />
      </ActionIcon>
    </>
  )
}

export function BoxBehavior({ parentModel }: { parentModel: SpatialModel }) {
  const { vis, scaledXDomain, scaledYDomain } = useVisContext()

  const [rect, setRect] = React.useState<Rectangle>()
  const dispatch = useDispatch()

  // register to mousedrag...
  useMouseDrag(
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

  useMouseDrag(
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

  useMouseDrag(
    MOUSE_DRAG_END,
    (event) => {
      if (rect) {
        const worldRect = new Rectangle(
          scaledXDomain.invert(rect.x),
          scaledYDomain.invert(rect.y),
          scaledXDomain.invert(rect.x + rect.width) -
            scaledXDomain.invert(rect.x),
          scaledYDomain.invert(rect.y + rect.height) -
            scaledYDomain.invert(rect.y)
        )

        const filter = new Array<number>()

        parentModel.flatSpatial.forEach((value, key) => {
          if (worldRect.within(value)) {
            filter.push(key)
          }
        })

        dispatch(
          addSubEmbedding({
            filter,
            Y: null,
            area: worldRect,
          })
        )

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

      {parentModel?.children.map((model) => {
        return (
          <SingleBox key={model.id} area={model.area} parentModel={model} />
        )
      })}
    </div>
  )
}

function SingleBox({
  area,
  parentModel,
}: {
  area: Rectangle
  parentModel: SpatialModel
}) {
  const { scaledXDomain, scaledYDomain } = useVisContext()
  const dispatch = useDispatch()

  return (
    <Group
      key={area.x}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        left: scaledXDomain(area.x),
        top: scaledYDomain(area.y),
        width: scaledXDomain(area.x + area.width) - scaledXDomain(area.x),
        height: scaledYDomain(area.y + area.height) - scaledYDomain(area.y),
        border: '3px solid black',
      }}
    >
      <ProjectButton
        filter={parentModel.filter}
        onFinish={(Y) => {
          dispatch(updateEmbedding({ Y, id: parentModel.id }))
        }}
        onDelete={() => {
          dispatch(removeEmbedding({ id: parentModel.id }))
        }}
      />
    </Group>
  )
}
