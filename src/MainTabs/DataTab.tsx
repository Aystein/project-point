import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  FileInput,
  Flex,
  Group,
  Input,
  Menu,
  rem,
  Stack,
  Text
} from '@mantine/core';
import * as React from 'react';
import { selectDatasets, useAppDispatch, useAppSelector } from '../Store/hooks';
import { loadDatasetGlobal } from '../Store/Store';
import { deleteDataset, loadDataset, storeDataset } from '../Store/FilesSlice';
import { parseCSV } from '../DataLoading/CSVLoader';
import {
  IconDatabase,
  IconDots,
  IconEye,
  IconFileZip,
  IconTrash,
} from '@tabler/icons-react';
import { useScatterStore } from '../Store/Zustand';

export function DataTab() {
  const dispatch = useAppDispatch();
  const [pickerFile, setPickerFile] = React.useState<File>();

  const handleChange = (file: File) => {
    setPickerFile(file);

    const reader = new FileReader();

    reader.onload = async () => {
      const content = reader.result.toString();

      const rows = await parseCSV(content);

      dispatch(loadDatasetGlobal(rows));
    };

    reader.readAsText(file);
  };

  return (
    <Flex direction={'column'} p="sm" gap="md">
      <Statistics />

      <FileInput
        placeholder="Pick file"
        label="CSV Upload"
        radius="xs"
        withAsterisk
        onChange={handleChange}
      />

      {pickerFile ? (
        <Button
          leftIcon={<IconDatabase size="1rem" />}
          onClick={() => {
            dispatch(
              storeDataset({ pickerFile, meta: { rows: 100, columns: 100 } })
            );
          }}
        >
          Save {pickerFile.name}
        </Button>
      ) : null}

      <DatasetList />
    </Flex>
  );
}

function Statistics() {
  const { rows, columns } = useAppSelector((state) => state.data);
  return (
    <Text>
      {rows.length} rows and {columns.length} columns
    </Text>
  );
}

function DatasetList() {
  const datasets = useAppSelector(selectDatasets);
  const dispatch = useAppDispatch();

  const updatePositions = useScatterStore((state) => state.updatePositions)

  const handleLoad = async (name: string) => {
    const rows = await dispatch(loadDataset(name)).unwrap();
    updatePositions(rows.map(() => ({ x: -1 + 2 * Math.random(), y: -1 + 2 * Math.random() })))
  };

  return (
    <Input.Wrapper label="Files">
      <Stack spacing={'sm'}>
        {datasets.map((entry) => {
          return (
            <Card shadow="sm" radius="md" key={entry.name} withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group position="apart">
                  <Anchor weight={500} onClick={() => handleLoad(entry.name)}>
                    {entry.name}
                  </Anchor>
                  <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                      <ActionIcon>
                        <IconDots size="1rem" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item icon={<IconFileZip size={rem(14)} />}>
                        Download zip (not implemented)
                      </Menu.Item>
                      <Menu.Item icon={<IconEye size={rem(14)} />}>
                        Preview all (not implemented)
                      </Menu.Item>
                      <Menu.Item
                        icon={<IconTrash size={rem(14)} />}
                        color="red"
                        onClick={() => {
                          dispatch(deleteDataset(entry.name));
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card.Section>

              <Card.Section withBorder inheritPadding py="xs">
                <Flex gap="xs" wrap={'wrap'}>
                  <Badge variant="dot" size="xs">
                    {entry.meta.rows} rows
                  </Badge>
                  <Badge variant="dot" size="xs">
                    {entry.meta.columns} columns
                  </Badge>
                </Flex>
              </Card.Section>
            </Card>
          );
        })}
      </Stack>
    </Input.Wrapper>
  );
}
