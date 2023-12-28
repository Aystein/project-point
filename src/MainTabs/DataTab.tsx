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
  Text,
} from '@mantine/core';
import * as React from 'react';
import { selectDatasets, useAppDispatch, useAppSelector } from '../Store/hooks';
import { loadDataset, loadDatasetGlobal, loadDatasetUrl } from '../Store/Store';
import { deleteDataset, storeDataset } from '../Store/FilesSlice';
import { parseCSV } from '../DataLoading/CSVLoader';
import {
  IconDatabase,
  IconDots,
  IconEye,
  IconFileZip,
  IconTrash,
} from '@tabler/icons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import index from '../../public/datasets/index.json';

const datasetEntries = JSON.parse(index) as string[];

console.log(datasetEntries);

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
    <Flex direction={'column'} p="sm" gap="md" style={{ overflowY: 'auto' }} mah={600} maw={400}>
      <FileInput
        miw={300}
        leftSection={<FontAwesomeIcon icon={faFolder} />}
        label="CSV Upload"
        placeholder="file.csv"
        radius="xs"
        withAsterisk
        onChange={handleChange}
      />

      {pickerFile ? (
        <Button
          leftSection={<IconDatabase size="1rem" />}
          onClick={() => {
            dispatch(
              storeDataset({ pickerFile })
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

  const handleLoad = (name: string) => {
    dispatch(loadDataset(name));
  };

  const handleLoadURL = (name: string) => {
    dispatch(loadDatasetUrl(name));
  }

  return (
    <Input.Wrapper label="Files">
      <Stack gap={'sm'}>
        {datasetEntries.map((entry) => {
          return <Card shadow="sm" radius="md" key={entry} withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Anchor onClick={() => handleLoadURL(entry)}>
                  {entry}
                </Anchor>
              </Group>
            </Card.Section>
          </Card>
        })}

        {datasets.map((entry) => {
          return (
            <Card shadow="sm" radius="md" key={entry.name} withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Anchor onClick={() => handleLoad(entry.name)}>
                    {entry.name}
                  </Anchor>
                  <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                      <ActionIcon variant='subtle'>
                        <IconDots size="1rem" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconFileZip />}>
                        Download zip (not implemented)
                      </Menu.Item>
                      <Menu.Item leftSection={<IconEye />}>
                        Preview all (not implemented)
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash />}
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
