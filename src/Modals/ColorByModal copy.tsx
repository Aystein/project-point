import React from 'react';
import { Button, Select } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { Selectors } from '../Store/Selectors';
import { useForm } from '@mantine/form';
import { DataType } from '../Interfaces';

export function ColorByModal({
  context,
  id,
  innerProps: { dataType, onFinish },
}: ContextModalProps<{
  onFinish: (feature: string) => void;
  dataType?: DataType;
}>) {
  const data = useSelector(Selectors.data);

  const options = React.useMemo(() => {
    return data.columns
      .filter((column) => !dataType || column.type === dataType)
      .map((column) => column.key);
  }, [data, dataType]);

  const form = useForm({
    initialValues: {
      feature: '',
    },

    validate: {},
  });

  const run = async (feature) => {
    onFinish(feature);
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
          nothingFoundMessage="No options"
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
