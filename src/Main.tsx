import * as React from 'react'
import { useSelector } from 'react-redux'
import { DataState } from './Store/DataSlice.'
import { Selectors } from './Store/Selectors'
import { ViewState } from './Store/ViewSlice'
import { PanBehavior } from './WebGL/Behavior/PanBehavior'
import { ZoomBehavior } from './WebGL/Behavior/ZoomBehavior'
import { Scatterplot } from './WebGL/Scatter/Scatterplot'
import { VisProvider } from './WebGL/VisualizationContext'
import { BoxBehavior } from './WebGL/Behavior/BoxBehavior'
import { allViews, useAppSelector } from './Store/hooks'
import { useMantineTheme } from '@mantine/core'
import { HoverBehavior } from './WebGL/Behavior/HoverBehavior'
import { SVGPlot } from './WebGL/Scatter/SVGPlot'

function MainView({
  data,
  view,
  hover,
  setHover,
}: {
  data: DataState
  view: ViewState
  hover: number
  setHover: (index: number) => void
}) {
  let { workspace } = view.attributes

  const theme = useMantineTheme()

  const [x, y] = React.useMemo(() => {
    if (!workspace) {
      return [null, null]
    }

    return [
      workspace.flatSpatial.map((value) => value.x),
      workspace.flatSpatial.map((value) => value.y),
    ]
  }, [workspace?.flatSpatial])

  switch (workspace?.oid) {
    default:
      return (
        <VisProvider>
          {false && (
            <Scatterplot
              n={workspace?.flatSpatial.length ?? null}
              model={workspace}
              x={x}
              x2=""
              y={y}
              color={theme.colors.cyan[7]}
              hover={hover}
            />
          )}
          <ZoomBehavior />
          <PanBehavior />
          <BoxBehavior parentModel={workspace} />
          <HoverBehavior
            positions={workspace?.flatSpatial}
            onHover={setHover}
          />
          <SVGPlot
            n={workspace?.flatSpatial.length ?? null}
            model={workspace}
            x={x}
            x2=""
            y={y}
            hover={hover}
          />
        </VisProvider>
      )
  }
}

export function Main() {
  const data = useSelector(Selectors.data)
  const views = useAppSelector(allViews.selectAll)
  const [hover, setHover] = React.useState<number>(null)

  return (
    <>
      {views.map((value) => {
        return (
          <MainView
            key={value.id}
            data={data}
            view={value}
            hover={hover}
            setHover={setHover}
          />
        )
      })}
    </>
  )
}
