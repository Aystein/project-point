import { Card, ScrollArea, Stack } from '@mantine/core';
import { EntityId } from '@reduxjs/toolkit';
import * as React from 'react';
import { SpatialModel } from '../Store/ModelSlice';
import { swapView } from '../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import { Scatterplot } from '../WebGL/Scatter/Scatterplot';
import { VisProvider } from '../WebGL/VisualizationContext';

function HistoryView({ view }: { view: SpatialModel }) {
  const selection = useAppSelector((state) => state.views.selection);
  const hover = useAppSelector((state) => state.views.hover);
  const dispatch = useAppDispatch();

  const memoizedSelection = React.useMemo(() => {
    if (!view || !selection) {
      return null;
    }

    const selectionSet = new Set(selection);
    const localSelection: Array<number> = [];

    view.filter.forEach((value, i) => {
      if (selectionSet.has(value)) {
        localSelection.push(i)
      }
    })


    return localSelection;
  }, [selection, view?.filter]);

  const memoizedHover = React.useMemo(() => {
    if (!view || !hover) {
      return null;
    }

    const filter = new Set(view.filter);
    return hover.filter((index) => filter.has(index));
  }, [hover, view?.filter]);

  const handleClick = (id: EntityId) => {
    dispatch(swapView({ id }));
  };

  return (
    <Card
      withBorder
      style={{ width: 200, height: 200, position: 'relative', flexShrink: 0 }}
      p={0}
      onClick={() => handleClick(view.id)}
    >
      <VisProvider defaultZoom={{ s: 2, tx: -100, ty: -100 }}>
        <Scatterplot
          n={view.filter.length}
          interpolate={false}
          x={view.x}
          y={view.y}
          selection={memoizedSelection}
          hover={memoizedHover}
        />
      </VisProvider>
    </Card>
  );
}

export function HistoryTab() {
  const history = useAppSelector((state) => state.views.history);

  return (

    <ScrollArea>
      <Stack
        align="center"
      >
        {history.map((view) => {
          return <HistoryView view={view} />;
        })}
      </Stack>
    </ScrollArea >

  );
}
