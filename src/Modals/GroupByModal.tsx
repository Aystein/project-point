import React from 'react';
import { Autocomplete, Button, Group, NumberInput, Select, Stack } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { Selectors } from '../Store/Selectors';
import { useForm } from '@mantine/form';
import { groupBy as rowGrouper } from 'lodash';
import 'react-data-grid/lib/styles.css';
import DataGrid, { SelectColumn } from 'react-data-grid';
import { VectorLike } from '../Interfaces';
import { encode } from '../DataLoading/Encode';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { runGroupLayout, runUMAPLayout } from '../Layouts/Layouts';

export function GroupByModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onFinish: (Y: VectorLike[]) => void;
  X: unknown[];
  area: IRectangle;
}>) {
  const data = useSelector(Selectors.data);
  console.log(data);
  const options = React.useMemo(() => {
    return data.columns.map((column) => column.key);
  }, [data]);

  const form = useForm({
    initialValues: {
      feature: '',
    },

    validate: {
    },
  });

  const run = async (feature) => {
    const Y = await runGroupLayout(innerProps.X, innerProps.area, feature);
    innerProps.onFinish(Y);
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => {
          context.closeModal(id);
          run(values.feature);
        })}
      >
        <Select
          label="Column"
          placeholder="Pick one"
          searchable
          withinPortal
          nothingFound="No options"
          data={options}
          {...form.getInputProps('feature')}
        />

        <Button mt="1.5rem" type="submit">
          Run
        </Button>
      </form>
    </>
  );
}
