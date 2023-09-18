import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataState } from './Store/DataSlice.';
import { Selectors } from './Store/Selectors';
import { PanBehavior } from './WebGL/Interaction/Behavior/PanBehavior';
import { ZoomBehavior } from './WebGL/Interaction/Behavior/ZoomBehavior';
import { Scatterplot } from './WebGL/Scatter/Scatterplot';
import { VisProvider, useVisContext } from './WebGL/VisualizationContext';
import { BoxBehavior } from './WebGL/Interaction/Behavior/BoxBehavior';
import { useAppSelector } from './Store/hooks';
import { Card, useMantineTheme } from '@mantine/core';
import { HoverBehavior } from './WebGL/Interaction/Behavior/HoverBehavior';
import { SpatialModel } from './Store/ModelSlice';
import { useHotkeys } from '@mantine/hooks';
import { LassoSelectionPlugin } from './WebGL/Interaction/Behavior/LassoBehavior';
import { addView, setHover } from './Store/ViewSlice';
import { TestRun } from './Scatter/Test/Util';

TestRun()

function MainView({ data, view }: { data: DataState; view: SpatialModel }) {
  const dispatch = useDispatch();
  const hover = useAppSelector((state) => state.views.localHover);
  const selection = useAppSelector((state) => state.views.localSelection);
  const globalSelection = useAppSelector((state) => state.views.selection);
  const line = useAppSelector((state) => state.views.lines);
  const positions = useAppSelector((state) => state.views.positions);

  const { scaledXDomain, scaledYDomain } = useVisContext();

  const handleHover = (index: number) => {
    dispatch(setHover([index]));
  };

  const [x, y] = React.useMemo(() => {
    if (!view) {
      return [null, null];
    }

    return [
      positions.map((value) => value.x),
      positions.map((value) => value.y),
    ];
  }, [positions]);

  return (
    <>
      <ZoomBehavior />
      <PanBehavior />

      <Card style={{ position: 'absolute', left: scaledXDomain(0), top: scaledYDomain(0), width: scaledXDomain(20) - scaledXDomain(0), height: scaledYDomain(20) - scaledYDomain(0) }} withBorder shadow="xs"></Card>

      <BoxBehavior parentModel={view} />
      <HoverBehavior positions={positions} onHover={handleHover} />
      <LassoSelectionPlugin />

      <Scatterplot
        n={positions.length ?? null}
        x={x}
        y={y}
        color={view.color}
        hover={hover}
        shape={view.shape}
        line={line}
        selection={selection}
        interpolate={true}
      />

    </>
  );
}

export function Main() {
  const data = useSelector(Selectors.data);
  const view = useAppSelector((state) => state.views.workspace);

  return (
    <>
      <VisProvider defaultZoom={{ s: 1, tx: 0, ty: 0 }}>
        {view ? <MainView key={view.id} data={data} view={view} /> : null}
      </VisProvider>
    </>
  );
}
