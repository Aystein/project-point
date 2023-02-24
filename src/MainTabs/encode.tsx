import { DataState } from "../Store/DataSlice.";
import { DataType, VectorLike } from "../Interfaces";

export function encode(
  data: DataState,
  keys: string[]
): { X: number[]; D: number; N: number } {
  const columns = data.columns.filter((column) => keys.includes(column.key));

  const hist = data.rows.map((row) => {
    return columns
      .map((column) => {
        const value = row[column.key];

        if (column.type === DataType.Numeric) {
          return value;
        }

        if (column.type === DataType.Ordinal) {
          const arr = new Array(column.domain.length).fill(0);
          arr[column.domain.indexOf(value)] = 1;
          return arr;
        }

        return null;
      })
      .flat();
  });

  return { X: hist.flat(), N: hist.length, D: hist[0].length };
}

export function unmap(array: number[]): VectorLike[] {
  const result = new Array<VectorLike>(array.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = {
      x: array[i * 2],
      y: array[i * 2 + 1],
    };
  }
  return result;
}
