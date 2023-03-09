import { useSelector } from "react-redux";
import { DataState } from "./Store/DataSlice.";
import { Model, modelAdapter } from "./Store/ModelSlice";
import { Selectors } from "./Store/Selectors";
import { viewAdapter, ViewState } from "./Store/ViewSlice";
import { isEntityId } from "./Util";
import { Scatterplot } from "./WebGL/Scatter/Scatterplot";

function MainView({ data, view }: { data: DataState; view: ViewState }) {
  let { workspace } = view.attributes;

  if (!workspace) {
    return null;
  }

  const modelEntity = useSelector(Selectors.models);
  let model = isEntityId(workspace)
    ? modelAdapter.getSelectors().selectById(modelEntity, workspace)
    : workspace;

  switch (model.oid) {
    case "spatial":
      return <Scatterplot model={model} xKey={"x"} yKey={"y"} />;
    case "neural":
      return <div>neural</div>;
  }
}

export function Main() {
  const data = useSelector(Selectors.data);
  const views = useSelector(Selectors.views);

  const viewValues = viewAdapter.getSelectors().selectAll(views.views);

  return (
    <>
      {viewValues.map((value) => {
        return <MainView data={data} view={value} />;
      })}
    </>
  );
}
