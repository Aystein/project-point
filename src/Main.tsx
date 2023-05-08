import * as React from 'react';
import { useSelector } from "react-redux";
import { DataState } from "./Store/DataSlice.";
import { Model, modelAdapter, SpatialModel } from "./Store/ModelSlice";
import { Selectors } from "./Store/Selectors";
import { viewAdapter, ViewState } from "./Store/ViewSlice";
import { isEntityId } from "./Util";
import { PanBehavior } from "./WebGL/Behavior/PanBehavior";
import { ZoomBehavior } from "./WebGL/Behavior/ZoomBehavior";
import { Scatterplot } from "./WebGL/Scatter/Scatterplot";
import { VisProvider } from "./WebGL/VisualizationContext";
import { BoxBehavior } from './WebGL/Behavior/BoxBehavior';

function MainView({ data, view }: { data: DataState; view: ViewState }) {
  let { workspace } = view.attributes;

  if (!workspace) {
    return null;
  }

  const modelEntity = useSelector(Selectors.models);
  let model = isEntityId(workspace)
    ? modelAdapter.getSelectors().selectById(modelEntity, workspace)
    : workspace;

  console.log(modelEntity);

  switch (model.oid) {
    //case "spatial":
    //  return <Scatterplot model={model} xKey={"x"} yKey={"y"} />;
    case "neural":
      return <div>neural</div>;
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


export function Main() {
  React.useEffect(() => {
    const worker = new Worker(
      new URL("./workers/testworker.ts", import.meta.url)
    );

    worker.onmessage = () => {
      console.log("hiho");
    }

    worker.postMessage(null);

  }, []);

  return <VisProvider>
    <Scatterplot model={model} x="" x2="" y="" />
    <ZoomBehavior />
    <PanBehavior />
    <BoxBehavior />
  </VisProvider>
}

export function Main2() {
  const data = useSelector(Selectors.data);
  const views = useSelector(Selectors.views);

  const viewValues = viewAdapter.getSelectors().selectAll(views.views);
  console.log(viewValues);
  return (
    <>
      {viewValues.map((value) => {
        return <MainView data={data} view={value} />;
      })}
    </>
  );
}
