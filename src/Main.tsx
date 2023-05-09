import * as React from 'react';
import { useSelector } from "react-redux";
import { DataState } from "./Store/DataSlice.";
import { modelAdapter, SpatialModel } from "./Store/ModelSlice";
import { Selectors } from "./Store/Selectors";
import { viewAdapter, ViewState } from "./Store/ViewSlice";
import { isEntityId } from "./Util";
import { PanBehavior } from "./WebGL/Behavior/PanBehavior";
import { ZoomBehavior } from "./WebGL/Behavior/ZoomBehavior";
import { Scatterplot } from "./WebGL/Scatter/Scatterplot";
import { VisProvider } from "./WebGL/VisualizationContext";
import { BoxBehavior } from './WebGL/Behavior/BoxBehavior';
import { allViews, useAppSelector } from './Store/hooks';



function MainView({ data, view }: { data: DataState; view: ViewState }) {
  let { workspace } = view.attributes;

  const modelEntity = useSelector(Selectors.models);

  console.log(modelEntity);
  if (!workspace) {
    return null;
  }

  let model = isEntityId(workspace)
    ? modelAdapter.getSelectors().selectById(modelEntity, workspace)
    : workspace;

  console.log(modelEntity);

  switch (model.oid) {
    //case "spatial":
    //  return <Scatterplot model={model} xKey={"x"} yKey={"y"} />;
    case "neural":
      return <div>neural</div>;
    default:
      return <VisProvider>
      <Scatterplot model={model} x="" x2="" y="" />
      <ZoomBehavior />
      <PanBehavior />
      <BoxBehavior />
    </VisProvider>
  }
}

const model: SpatialModel = {
  oid: "spatial",
  id: 'test',
  spatial: [],
  bounds: {
    minX: 0,
    maxX: 10,
    minY: 0,
    maxY: 10,
  },
}


export function Main2() {
  React.useEffect(() => {
    const worker = new Worker(
      new URL("./Workers/testworker.ts", import.meta.url)
    );

    worker.onmessage = () => {
      console.log("hiho");
    }

    worker.postMessage(null);

  }, []);

  const data = useSelector(Selectors.data);
  const views = useSelector(Selectors.views);

  console.log(data);
  console.log(views);

  return <VisProvider>
    <Scatterplot model={model} x="" x2="" y="" />
    <ZoomBehavior />
    <PanBehavior />
    <BoxBehavior />
  </VisProvider>
}

export function Main() {
  const data = useSelector(Selectors.data);
  const views = useAppSelector(allViews.selectAll);

  console.log(views);
  return (
    <>
      {views.map((value) => {
        return <MainView key={value.id} data={data} view={value} />;
      })}
    </>
  );
}
