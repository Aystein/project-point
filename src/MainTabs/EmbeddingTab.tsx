import { Select } from '@mantine/core'
import { useMemo } from 'react'
import 'react-data-grid/lib/styles.css'
import { useDispatch, useSelector } from 'react-redux'
import { Selectors } from '../Store/Selectors'
import { modelAdapter } from '../Store/ModelSlice'
import { TSNE } from './tSNE'

export function EmbeddingTab() {
  const models = useSelector(Selectors.models)
  const dispatch = useDispatch()

  const items = useMemo(() => {
    return modelAdapter
      .getSelectors()
      .selectAll(models)
      .map((value) => ({
        value: value.id as string,
        label: 'umap',
      }))
  }, [models])

  return (
    <div>
      <TSNE />
    </div>
  )
}
