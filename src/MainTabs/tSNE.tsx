import { Button, Flex, Group, Modal, NumberInput, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { groupBy as rowGrouper } from 'lodash'
import 'react-data-grid/lib/styles.css'
import DataGrid, { SelectColumn } from 'react-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import { showNotification, updateNotification } from '@mantine/notifications'
import { Selectors } from '../Store/Selectors'
import { VectorLike } from '../Interfaces'
import { encode } from './encode'
import { updatePosition } from '../Store/ViewSlice'

export function TSNE({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) {
  const data = useSelector(Selectors.data)
  const dispatch = useDispatch()

  const form = useForm({
    initialValues: {
      perplexity: 30,
    },

    validate: {
      perplexity: (value) => (value >= 10 ? null : 'Must be at least 10'),
    },
  })

  const [expandedGroupIds, setExpandedGroupIds] = useState<
    ReadonlySet<unknown>
  >(() => new Set<unknown>([]))
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set()
  )

  const columns = [SelectColumn, { key: 'name', name: 'ID' }]

  const rows = data.columns.map((column, id) => ({
    id,
    name: column.key,
  }))

  const run = () => {
    showNotification({
      id: 'tsne',
      title: 't-SNE',
      message: 'Computing t-SNE ...',
      loading: true,
      autoClose: false,
      color: 'teal',
    })

    const result = Array.from(selectedRows).map((value) => rows[value].name)

    const { X, N, D } = encode(data, result)

    const worker = new Worker(new URL('../Workers/test.ts', import.meta.url))
    worker.postMessage({
      X,
      N,
      D,
      type: 'init',
    })
    worker.onmessage = ({
      data: { type, Y },
    }: {
      data: { Y: VectorLike[]; type: string }
    }) => {
      switch (type) {
        case 'finish':
          updateNotification({
            id: 'tsne',
            autoClose: 3000,
            message: 't-SNE completed!',
            color: 'green',
          })

          dispatch(updatePosition(Y))
          break
      }
    }
  }

  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      title="t-SNE"
      size="70%"
    >
      <form
        onSubmit={form.onSubmit((values) => {
          setOpen(false)
          run()
        })}
      >
        <DataGrid
          groupBy={['title']}
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
    </Modal>
  )
}
