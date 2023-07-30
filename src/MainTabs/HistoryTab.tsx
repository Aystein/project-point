import { AspectRatio, Button, Card, CloseButton, Group, ScrollArea, Stack, Text, rem, useMantineTheme } from '@mantine/core';
import { EntityId } from '@reduxjs/toolkit';
import * as React from 'react';
import { SpatialModel } from '../Store/ModelSlice';
import { deleteHistory, swapView } from '../Store/ViewSlice';
import { useAppDispatch, useAppSelector } from '../Store/hooks';
import { Scatterplot } from '../WebGL/Scatter/Scatterplot';
import { VisProvider } from '../WebGL/VisualizationContext';
import { getBounds } from '../Util';

function HistoryView({ view, active, index }: { view: SpatialModel, active: boolean; index: number }) {
  const selection = useAppSelector((state) => state.views.selection);
  const hover = useAppSelector((state) => state.views.hover);
  const dispatch = useAppDispatch();
  const theme = useMantineTheme();

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

  const outlineColor = theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3];
  const activeColor = theme.fn.variant({ color: theme.primaryColor, variant: 'outline' });

  return (
    <Card
      style={{
        outlineColor: active ? activeColor.border : outlineColor,
        outlineWidth: active ? 2 : 1,
        outlineStyle: 'solid'
      }}
    >
      <Card.Section px={rem(4)} p={rem(4)}>
        <Group position="apart">
          <Text weight={500} size="sm">Review pictures</Text>

          <CloseButton onClick={() => dispatch(deleteHistory({ historyIndex: index }))} />
        </Group>
      </Card.Section>

      <Card.Section withBorder onClick={() => handleClick(view.id)} style={{background: 'white' }}>
        <AspectRatio ratio={1 / 1}>
          <VisProvider defaultXDomain={[view.area.x, view.area.x + view.area.width]}>
            <Scatterplot
              n={view.filter.length}
              interpolate={false}
              x={view.x}
              y={view.y}
              selection={memoizedSelection}
              hover={memoizedHover}
            />
          </VisProvider>
        </AspectRatio>
      </Card.Section>

      <Card.Section p={rem(4)}>
        <Group position="apart">
          <Text size="sm">{view.filter.length} items</Text>
        </Group>
      </Card.Section>
    </Card >
  );
}

export function HistoryTab() {
  const history = useAppSelector((state) => state.views.history);
  const activeHistory = useAppSelector((state) => state.views.activeHistory);

  return (
    <>
      <Button m={"md"} style={{ flexShrink: 0 }}>Create snapshot</Button>
      <ScrollArea>
        <Stack
          align="stretch"
          p={"md"}
        >
          {history.map((view, i) => {
            return <HistoryView view={view} active={activeHistory === i} index={i} />;
          })}
        </Stack>
      </ScrollArea >
    </>
  );
}
