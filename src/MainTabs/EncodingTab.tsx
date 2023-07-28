import { Select, Stack } from '@mantine/core';
import { useAppSelector } from '../Store/hooks';

function ColorEncoding() {
  const { rows, columns } = useAppSelector((state) => state.data);

  return (
    <>
      <Select data={columns.map((column) => column.key)} />
    </>
  );
}

export function EncodingTab() {
  const rows = useAppSelector((state) => state.data.rows);

  return (
    <Stack>
      <ColorEncoding />
    </Stack>
  );
}
