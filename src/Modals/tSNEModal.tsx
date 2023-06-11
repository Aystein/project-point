import React from 'react';
import { Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core';
import { openContextModal, ContextModalProps } from '@mantine/modals';
import { useDispatch, useSelector } from 'react-redux';
import { Selectors } from '../Store/Selectors';
import { useForm } from '@mantine/form';
import { groupBy as rowGrouper } from 'lodash';
import 'react-data-grid/lib/styles.css';
import DataGrid, { SelectColumn } from 'react-data-grid';
import { showNotification, updateNotification } from '@mantine/notifications';
import { VectorLike } from '../Interfaces';
import { encode } from '../DataLoading/Encode';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { runUMAPLayout } from '../Layouts/Layouts';
import { useAppSelector } from '../Store/hooks';
import { EntityId } from '@reduxjs/toolkit';

export function TSNEModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onFinish: (Y: VectorLike[]) => void;
  id: EntityId;
  axis: 'x' | 'y' | 'xy';
}>) {
  const data = useSelector(Selectors.data);
  const model = useAppSelector((state) => state.views.workspace.children?.find((e) => e.id === innerProps.id))

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

    const Y = await runUMAPLayout({
      X,
      N,
      D,
      area: model.area,
      axis: innerProps.axis,
      xLayout: model.spatial.map((x) => x.x),
      yLayout: model.spatial.map((x) => x.y),
    });
    innerProps.onFinish(Y);
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
