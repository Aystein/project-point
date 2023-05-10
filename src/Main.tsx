import * as React from 'react'
import { useSelector } from 'react-redux'
import { DataState } from './Store/DataSlice.'
import { modelAdapter, SpatialModel } from './Store/ModelSlice'
import { Selectors } from './Store/Selectors'
import { ViewState } from './Store/ViewSlice'
import { isEntityId } from './Util'
import { PanBehavior } from './WebGL/Behavior/PanBehavior'
import { ZoomBehavior } from './WebGL/Behavior/ZoomBehavior'
import { Scatterplot } from './WebGL/Scatter/Scatterplot'
import { VisProvider } from './WebGL/VisualizationContext'
import { BoxBehavior } from './WebGL/Behavior/BoxBehavior'
import { allViews, useAppSelector } from './Store/hooks'
import { useMantineTheme } from '@mantine/core'

function MainView({ data, view }: { data: DataState; view: ViewState }) {
  let { workspace } = view.attributes

  const modelEntity = useSelector(Selectors.models)
  const theme = useMantineTheme();

  if (!workspace) {
    return null
  }

  let model = isEntityId(workspace)
    ? modelAdapter.getSelectors().selectById(modelEntity, workspace)
    : workspace

  switch (model.oid) {
    case 'neural':
      return <div>neural</div>
    default:
      return (
        <VisProvider>
          <Scatterplot model={model} x="" x2="" y="" color={theme.colors.cyan[7]} />
          <ZoomBehavior />
          <PanBehavior />
          <BoxBehavior />
        </VisProvider>
      )
  }
}

export function Main() {
  const data = useSelector(Selectors.data)
  const views = useAppSelector(allViews.selectAll)

  return (
    <>
      {views.map((value) => {
        return <MainView key={value.id} data={data} view={value} />
      })}
    </>
  )
}
