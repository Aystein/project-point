import { Button, Group, NumberInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { EntityId } from '@reduxjs/toolkit';
import { groupBy as rowGrouper } from 'lodash';
import React from 'react';
import DataGrid, { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useSelector } from 'react-redux';
import { encode } from '../DataLoading/Encode';
import { VectorLike } from '../Interfaces';
import { runUMAPLayout } from '../Layouts/Layouts';
import { Selectors } from '../Store/Selectors';
import { useAppSelector } from '../Store/hooks';

export function TSNEModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onFinish: ({
    Y,
    x,
    y,
  }: {
    Y: VectorLike[];
    x: number[];
    y: number[];
  }) => void;
  id: EntityId;
  axis: 'x' | 'y' | 'xy';
}>) {
  const data = useSelector(Selectors.data);
  const model = useAppSelector((state) =>
    state.views.workspace.children?.find((e) => e.id === innerProps.id)
  );
  const xl = useAppSelector((state) => state.views.workspace.x);
  const yl = useAppSelector((state) => state.views.workspace.y);

  const form = useForm({
    initialValues: {
      perplexity: 30,
    },

    validate: {
      perplexity: (value) => (value >= 10 ? null : 'Must be at least 10'),
    },
  });

  const [expandedGroupIds, setExpandedGroupIds] = React.useState<
    ReadonlySet<unknown>
  >(() => new Set<unknown>([]));
  const [selectedRows, setSelectedRows] = React.useState<ReadonlySet<number>>(
    () => new Set()
  );

  const columns = [
    SelectColumn,
    { key: 'group', name: 'Group' },
    { key: 'name', name: 'ID' },
  ];

  const rows = data.columns.map((column, columnId) => ({
    id: columnId,
    name: column.key,
    group: column.group ?? 'Default',
  }));

  const run = async () => {
    const result = Array.from(selectedRows).map((value) => rows[value].name);

    const { X, N, D } = encode(data, model.filter, result);

    const { Y, x, y } = await runUMAPLayout({
      X,
      N,
      D,
      area: model.area,
      axis: innerProps.axis,
      xLayout: model.filter.map((i) => xl[i]),
      yLayout: model.filter.map((i) => yl[i]),
    });
    innerProps.onFinish({ Y, x, y });
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => {
          context.closeModal(id);
          run();
        })}
      >
        <DataGrid
          groupBy={['group']}
          rowGrouper={rowGrouper}
          expandedGroupIds={expandedGroupIds}
          onExpandedGroupIdsChange={setExpandedGroupIds}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id}
          rows={rows}
          columns={columns}
        ></DataGrid>

        <Group>
          <Stack>
            <NumberInput
              defaultValue={30}
              placeholder="Perplexity"
              label="Perplexity"
              withAsterisk
              {...form.getInputProps('perplexity')}
            />
          </Stack>
          <Stack>test</Stack>
        </Group>

        <Button mt="1.5rem" type="submit">
          Run
        </Button>
      </form>
    </>
  );
}