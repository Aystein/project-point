import { FileInput, Flex, NavLink } from '@mantine/core'
import Papa from 'papaparse'
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { PapaPlugin } from '../PapaPlugin/PapaPlugin'
import { Row } from '../Store/DataSlice.'
import { selectDatasets, useAppDispatch, useAppSelector } from '../Store/hooks'
import { loadDatasetGlobal } from '../Store/Store'
import { loadDataset } from '../Store/DatasetSlice'
import { parseCSV } from '../Loading/CSVLoader'

async function storeFileForLater(name: string, content: string) {
  const opfsRoot = await navigator.storage.getDirectory()

  const fileHandle = await opfsRoot.getFileHandle(name, { create: true })
  // Get a writable stream.
  // @ts-ignore
  const writable = await fileHandle.createWritable()
  // Write the contents of the file to the stream.
  await writable.write(content)
  // Close the stream, which persists the contents.
  await writable.close()
}

export function DataTab() {
  const dispatch = useAppDispatch()

  const handleChange = (file: File) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const content = reader.result.toString()
      storeFileForLater(file.name, content)

      const rows = await parseCSV(content)
      dispatch(loadDatasetGlobal(rows))
    }

    reader.readAsText(file)
  }

  return (
    <Flex direction={'column'}>
      <Statistics />

      <FileInput
        placeholder="Pick file"
        label="CSV Upload"
        radius="xs"
        size="xs"
        withAsterisk
        onChange={handleChange}
      />

      <DatasetList />
    </Flex>
  )
}

function Statistics() {
  const { rows, columns } = useAppSelector((state) => state.data)
  return (
    <div>
      {rows.length} rows and {columns.length} columns
    </div>
  )
}

function DatasetList() {
  const datasets = useAppSelector(selectDatasets)
  const dispatch = useAppDispatch()

  const handleLoad = (name: string) => {
    dispatch(loadDataset(name))
  }

  return (
    <Flex direction={'column'} p={'1rem'}>
      {datasets.map((name) => {
        return (
          <NavLink
            key={name}
            onClick={() => handleLoad(name)}
            label={name}
            active
          />
        )
      })}
    </Flex>
  )
}
