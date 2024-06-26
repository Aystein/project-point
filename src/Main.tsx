import { Card } from '@mantine/core';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataState } from './Store/DataSlice.';
import { Selectors } from './Store/Selectors';
import { setHover } from './Store/ViewSlice';
import { useAppSelector } from './Store/hooks';
import { BoxBehavior } from './WebGL/Interaction/Behavior/BoxBehavior';
import { HoverBehavior } from './WebGL/Interaction/Behavior/HoverBehavior';
import { LassoSelectionPlugin } from './WebGL/Interaction/Behavior/LassoBehavior';
import { PanBehavior } from './WebGL/Interaction/Behavior/PanBehavior';
import { ZoomBehavior } from './WebGL/Interaction/Behavior/ZoomBehavior';
import { Scatterplot } from './WebGL/Scatter/Scatterplot';
import { VisProvider, useVisContext } from './WebGL/VisualizationContext';
import { SemanticBehavior } from './WebGL/Interaction/Behavior/SemanticBehaviour';
import { UndoBehavior } from './WebGL/Interaction/Behavior/UndoBehavior';
import { BundleBehavior } from './WebGL/Interaction/Behavior/BundleBehavior';

function MainView({ data }: { data: DataState; }) {
  const dispatch = useDispatch();
  const hover = useAppSelector((state) => state.views.present.localHover);
  const selection = useAppSelector((state) => state.views.present.localSelection);
  const line = useAppSelector((state) => state.views.present.lines);
  const positions = useAppSelector((state) => state.views.present.positions);
  const color = useAppSelector((state) => state.views.present.color);
  const shape = useAppSelector((state) => state.views.present.shape);
  const bounds = useAppSelector((state) => state.views.present.bounds);
  const shadows = useAppSelector((state) => state.views.present.shadows);
  const clustering = useAppSelector((state) => state.views.present.clustering);

  const { scaledXDomain, scaledYDomain } = useVisContext();

  const handleHover = (index: number) => {
    dispatch(setHover([index]));
  };
  // console.log(positions);
  const [x, y] = React.useMemo(() => {
    if (!data.id) {
      return [null, null];
    }

    const newPositions = [...positions];
    clustering.forEach((cluster) => {
      cluster.indices.forEach((index) => {
        newPositions[index] = cluster.centroid;
      })
    })

    return [
      newPositions.map((value) => value.x),
      newPositions.map((value) => value.y),
    ];
  }, [positions, clustering]);

  return (
    <>
      <ZoomBehavior />


      <Card style={{ position: 'absolute', left: scaledXDomain(0), top: scaledYDomain(0), width: scaledXDomain(20) - scaledXDomain(0), height: scaledYDomain(20) - scaledYDomain(0) }} withBorder shadow="xs"></Card>

      <BoxBehavior />
      <HoverBehavior positions={positions} onHover={handleHover} />
      <LassoSelectionPlugin />

      <PanBehavior />
      <SemanticBehavior />

      <UndoBehavior />

      <Scatterplot
        n={data.rows.length}
        x={x}
        y={y}
        bounds={bounds}
        color={color}
        hover={hover}
        shape={shape}
        line={line}
        selection={selection}
        interpolate={true}
        shadows={shadows}
      />

      <BundleBehavior />
    </>
  );
}

export function Main() {
  const data = useSelector(Selectors.data);

  return (
    <>
      <VisProvider defaultZoom={{ s: 1, tx: 0, ty: 0 }}>
        {data ? <MainView data={data} /> : null}
      </VisProvider>
    </>
  );
}
