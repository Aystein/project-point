import * as React from 'react'
import { quadtree } from 'd3-quadtree'
import { VectorLike } from '../../Interfaces'
import { useMouseDrag } from './useMouseDrag'
import { COMMAND_PRIORITY_NORMAL, MOUSE_HOVER } from '../Commands'
import { useVisContext } from '../VisualizationContext'
import { Affix, Button, Card, Transition, rem } from '@mantine/core'
import { useAppSelector } from '../../Store/hooks'
import { Row } from '../../Store/DataSlice.'

export function HoverBehavior({
  positions,
  onHover,
}: {
  positions: VectorLike[]
  onHover: (index: number) => void
}) {
  const { scaledXDomain, scaledYDomain, requestFrame } = useVisContext()
  const [lastHover, setLastHover] = React.useState<number>(null)
  const data = useAppSelector((state) => state.data)

  const tree = React.useMemo(() => {
    return positions
      ? quadtree<VectorLike & { index: number }>()
          .x((d) => d.x)
          .y((d) => d.y)
          .addAll(positions.map((value, i) => ({ ...value, index: i })))
      : null
  }, [positions])

  useMouseDrag(
    MOUSE_HOVER,
    (event) => {
      if (!tree) {
        return false
      }

      const hover = tree.find(
        scaledXDomain.invert(event.offsetX),
        scaledYDomain.invert(event.offsetY)
      ).index

      if (lastHover !== hover) {
        onHover(hover)
        requestFrame()
        setLastHover(hover)
      }

      return true
    },
    COMMAND_PRIORITY_NORMAL,
    [tree, scaledXDomain, scaledYDomain, onHover, lastHover, setLastHover]
  )

  return (
    <Affix position={{ bottom: rem(20), right: rem(20) }}>
      <Card shadow="lg">
        <Card.Section>
          <HoverComponent row={data.rows[lastHover]} />
        </Card.Section>
      </Card>
    </Affix>
  )
}

function HoverComponent({ row }: { row: Row }) {
  return row ? <div>{row.index}</div> : null
}
