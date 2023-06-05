import Papa from 'papaparse'
import { Row } from '../Store/DataSlice.'
import { PapaPlugin } from './PapaPlugin'

export function parseCSV(content: string): Promise<Row[]> {
  return new Promise((resolve) => {
    const plugin = new PapaPlugin<Row>()

    Papa.parse<Row>(content, {
      header: true,
      skipEmptyLines: true,
      step: plugin.step,
      complete: () => {
        resolve(plugin.data)
      },
      dynamicTyping: true,
    })
  })
}
