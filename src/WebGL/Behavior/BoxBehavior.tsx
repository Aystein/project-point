import * as React from 'react'
import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  MOUSE_DRAG,
  MOUSE_DRAGGING,
  MOUSE_DRAG_END,
} from '../Commands'
import { useVisContext } from '../VisualizationContext'
import { IRectangle, Rectangle } from '../Math/Rectangle'
import { ActionIcon, Button, Group, Menu } from '@mantine/core'
import { SpatialModel } from '../../Store/ModelSlice'
import { openContextModal } from '@mantine/modals'
import { useDispatch } from 'react-redux'
import { VectorLike } from '../../Interfaces'
import {
  addSubEmbedding,
  removeEmbedding,
  translateArea,
  updateEmbedding,
} from '../../Store/ViewSlice'
import { IconX } from '@tabler/icons-react'
import { useMouseDrag } from './useMouseDrag'
import { useDrag } from '../../hooks/use-drag'
import { runCondenseLayout, runGroupLayout } from '../../Layouts/condense'
import { useAppSelector } from '../../Store/hooks'

function ProjectButton({
  filter,
  onFinish,
  onDelete,
  area,
}: {
  filter: number[]
  onFinish: (Y: VectorLike[]) => void
  onDelete: () => void
  area: IRectangle
}) {
  return (
    <>
      <Button
        style={{ pointerEvents: 'auto', opacity: 1 }}
        variant="outline"
        onClick={() => {
          openContextModal({
            modal: 'demonstration',
            title: 't-SNE embedding',
            size: '70%',
            innerProps: {
              area,
              filter,
              onFinish,
            },
          })
        }}
      >
        UMAP
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
    COMMAND_PRIORITY_NORMAL,
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
    COMMAND_PRIORITY_NORMAL,
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
    COMMAND_PRIORITY_NORMAL,
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
  area: IRectangle
  parentModel: SpatialModel
}) {
  const { scaledXDomain, scaledYDomain, world } = useVisContext()
  const dispatch = useDispatch()
  const data = useAppSelector((state) => state.data.rows)


  const handleCondense = async () => {
    const Y = await runCondenseLayout(parentModel.filter.length, area)
    console.log(Y)

    dispatch(updateEmbedding({ id: parentModel.id, Y }))
  }

  const handleGroupBy = async () => {
    const Y = await runGroupLayout(parentModel.filter.map((i) => data[i]), area, 'Type 1')

    dispatch(updateEmbedding({ id: parentModel.id, Y }))
  }

  const { ref, active } = useDrag((value) => {
    console.log(value)
  })

  useMouseDrag(
    MOUSE_DRAGGING,
    (event) => {
      if (
        Rectangle.deserialize(area).within({
          x: scaledXDomain.invert(event.offsetX),
          y: scaledYDomain.invert(event.offsetY),
        })
      ) {
        dispatch(
          translateArea({
            id: parentModel.id,
            x: world(event.movementX),
            y: world(event.movementY),
          })
        )
        return true
      }
      return false
    },
    COMMAND_PRIORITY_CRITICAL,
    [world, parentModel, area]
  )

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
        borderLeft: '1px solid black',
        borderBottom: '1px solid black',
      }}
    >
      <Group
        style={{
          position: 'absolute',
          top: 0,
        }}
      >
        <Menu shadow="md" width={200}>
          <div ref={ref} style={{ pointerEvents: 'auto' }}>drag</div>

          <Menu.Target>
            <Button style={{ pointerEvents: 'auto' }}>More</Button>
          </Menu.Target>

          <Menu.Dropdown style={{ pointerEvents: 'auto' }}>
            <Menu.Item onClick={handleCondense}>Condense</Menu.Item>
            <Menu.Item onClick={handleGroupBy}>Group by</Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <ProjectButton
          filter={parentModel.filter}
          area={area}
          onFinish={(Y) => {
            dispatch(updateEmbedding({ Y, id: parentModel.id }))
          }}
          onDelete={() => {
            dispatch(removeEmbedding({ id: parentModel.id }))
          }}
        />
      </Group>
    </Group>
  )
}
