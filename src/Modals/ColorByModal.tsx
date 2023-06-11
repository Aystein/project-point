import React from 'react';
import { Button, Select } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { Selectors } from '../Store/Selectors';
import { useForm } from '@mantine/form';
import { VectorLike } from '../Interfaces';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { runGroupLayout } from '../Layouts/Layouts';

export function ColorByModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onFinish: (feature: string) => void;
  X: unknown[];
  area: IRectangle;
}>) {
  const data = useSelector(Selectors.data);

  const options = React.useMemo(() => {
    return data.columns.map((column) => column.key);
  }, [data]);

  const form = useForm({
    initialValues: {
      feature: '',
    },

    validate: {},
  });

  const run = async (feature) => {
    innerProps.onFinish(feature)
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
