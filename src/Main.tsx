import * as React from 'react';
import { useSelector } from 'react-redux';
import { DataState } from './Store/DataSlice.';
import { Selectors } from './Store/Selectors';
import { PanBehavior } from './WebGL/Interaction/Behavior/PanBehavior';
import { ZoomBehavior } from './WebGL/Interaction/Behavior/ZoomBehavior';
import { Scatterplot } from './WebGL/Scatter/Scatterplot';
import { VisProvider } from './WebGL/VisualizationContext';
import { BoxBehavior } from './WebGL/Interaction/Behavior/BoxBehavior';
import { useAppSelector } from './Store/hooks';
import { useMantineTheme } from '@mantine/core';
import { HoverBehavior } from './WebGL/Interaction/Behavior/HoverBehavior';
import { SpatialModel } from './Store/ModelSlice';
import { useHotkeys } from '@mantine/hooks';
import { LassoSelectionPlugin } from './WebGL/Interaction/Behavior/LassoBehavior';

function MainView({
  data,
  view,
  hover,
  setHover,
}: {
  data: DataState;
  view: SpatialModel;
  hover: number;
  setHover: (index: number) => void;
}) {
  const theme = useMantineTheme();

  const handleLasso = () => {};

  useHotkeys([['ctrl+S', handleLasso]]);

  const [x, y] = React.useMemo(() => {
    if (!view) {
      return [null, null];
    }

    return [
      view.flatSpatial.map((value) => value.x),
      view.flatSpatial.map((value) => value.y),
    ];
  }, [view?.flatSpatial]);

  switch (view?.oid) {
    default:
      return (
        <VisProvider>
          <Scatterplot
            n={view?.flatSpatial.length ?? null}
            model={view}
            x={x}
            x2=""
            y={y}
            color={view.color}
            hover={hover}
            interpolate={view.interpolate}
            shape={view.shape}
          />

          <ZoomBehavior />
          <PanBehavior />
          <BoxBehavior parentModel={view} />
          <HoverBehavior positions={view?.flatSpatial} onHover={setHover} />
          <LassoSelectionPlugin />
        </VisProvider>
      );
  }
}

export function Main() {
  const data = useSelector(Selectors.data);
  const view = useAppSelector((state) => state.views.workspace);
  const [hover, setHover] = React.useState<number>(null);

  return (
    <>
      {view ? (
        <MainView
          key={view.id}
          data={data}
          view={view}
          hover={hover}
          setHover={setHover}
        />
      ) : null}
    </>
  );
}
