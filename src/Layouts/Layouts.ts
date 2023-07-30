import { showNotification, updateNotification } from '@mantine/notifications';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { VectorLike } from '../Interfaces';
import { LabelContainer } from '../Store/ModelSlice';

export function runLayout<T>(params: T, worker: Worker) {
  worker.postMessage({
    ...params,
    type: 'init',
  });

  showNotification({
    id: 'tsne',
    title: 't-SNE',
    message: 'Computing t-SNE ...',
    loading: true,
    autoClose: false,
    color: 'teal',
  });

  return new Promise<{
    Y: VectorLike[];
    x: number[];
    y: number[];
    labels: LabelContainer;
  }>((resolve) => {
    worker.onmessage = ({
      data: { type, Y, xLayout, yLayout, labels },
    }: {
      data: {
        Y: VectorLike[];
        type: string;
        xLayout: number[];
        yLayout: number[];
        labels: LabelContainer;
      };
    }) => {
      switch (type) {
        case 'finish':
          resolve({ Y, x: xLayout, y: yLayout, labels });

          updateNotification({
            id: 'tsne',
            autoClose: 3000,
            message: 't-SNE completed!',
            color: 'green',
          });

          break;
      }
    };
  });
}

export function runCondenseLayout(
  n: number,
  area: IRectangle,
  axis,
  xLayout,
  yLayout
) {
  return runLayout(
    { n, area, axis, xLayout, yLayout },
    new Worker(new URL('../Workers/condense.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runGroupLayout(
  X,
  area: IRectangle,
  feature: string,
  axis: 'x' | 'y',
  xLayout: number[],
  yLayout: number[]
) {
  return runLayout(
    { X, area, feature, axis, xLayout, yLayout },
    new Worker(new URL('../Workers/group.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runSpaghettiLayout(
  X,
  area: IRectangle,
  feature: string,
  axis: 'x' | 'y',
) {
  return runLayout(
    { X, area, feature, axis },
    new Worker(new URL('../Workers/spaghetti.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runUMAPLayout({ X, N, D, area, axis, xLayout, yLayout }) {
  return runLayout(
    { X, N, D, area, axis, xLayout, yLayout },
    new Worker(new URL('../Workers/umap.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runForceLayout({
  N,
  area,
  xLayout,
  yLayout,
  axis,
}: {
  N: number;
  area: IRectangle;
  xLayout: number[];
  yLayout: number[];
  axis: 'x' | 'y' | 'xy';
}) {
  return runLayout(
    { N, area, xLayout, yLayout, axis },
    new Worker(new URL('../Workers/force.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}
