import * as React from 'react';
import { useSelector } from 'react-redux';
import { DataState } from './Store/DataSlice.';
import { Selectors } from './Store/Selectors';
import { PanBehavior } from './WebGL/Behavior/PanBehavior';
import { ZoomBehavior } from './WebGL/Behavior/ZoomBehavior';
import { Scatterplot } from './WebGL/Scatter/Scatterplot';
import { VisProvider } from './WebGL/VisualizationContext';
import { BoxBehavior } from './WebGL/Behavior/BoxBehavior';
import {  useAppSelector } from './Store/hooks';
import { useMantineTheme } from '@mantine/core';
import { HoverBehavior } from './WebGL/Behavior/HoverBehavior';
import { SVGPlot } from './WebGL/Scatter/SVGPlot';
import { SpatialModel } from './Store/ModelSlice';

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
            color={theme.colors.cyan[7]}
            hover={hover}
            interpolate={true}
          />

          <ZoomBehavior />
          <PanBehavior />
          <BoxBehavior parentModel={view} />
          <HoverBehavior positions={view?.flatSpatial} onHover={setHover} />
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
