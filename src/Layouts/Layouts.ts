import { showNotification, updateNotification } from '@mantine/notifications';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { VectorLike } from '../Interfaces';
import { LabelContainer } from '../Store/ModelSlice';
import { Vector } from 'umap-js/dist/umap';

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
    labels: LabelContainer[];
  }>((resolve) => {
    worker.onmessage = ({
      data: { type, Y, xLayout, yLayout, labels },
    }: {
      data: {
        Y: VectorLike[];
        type: string;
        xLayout: number[];
        yLayout: number[];
        labels: LabelContainer[];
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
  X,
) {
  return runLayout(
    { n, area, axis, X },
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
) {
  return runLayout(
    { X, area, feature, axis },
    new Worker(new URL('../Workers/group.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runSpaghettiLayout(
  X,
  area: IRectangle,
  features: string[],
  secondary: string,
  axis: 'x' | 'y',
  Y_in,
) {
  return runLayout(
    { X, area, features, secondary, axis, Y_in },
    new Worker(new URL('../Workers/spaghetti.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runUMAPLayout({ X, N, D, area, axis, Y_in }) {
  return runLayout(
    { X, N, D, area, axis, Y_in },
    new Worker(new URL('../Workers/umap.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}

export function runForceLayout({
  N,
  area,
  Y_in,
  axis,
  X,
}: {
  N: number;
  area: IRectangle;
  Y_in: VectorLike[];
  axis: 'x' | 'y' | 'xy';
  X: number[];
}) {
  return runLayout(
    { N, area, Y_in, axis, X },
    new Worker(new URL('../Workers/force.worker.ts', import.meta.url), {
      type: 'module',
    })
  );
}


export function fillOperation({
  N,
  area,
}: {
  N: number;
  area: IRectangle;
}) {

  const worker = new Worker(new URL('../Workers/layout.worker.ts', import.meta.url), {
    type: 'module',
  })

  const promise = new Promise<{
    Y: VectorLike[];
  }>((resolve) => {
    worker.onmessage = ({
      data: { Y },
    }: {
      data: {
        Y: VectorLike[];
      };
    }) => {
      resolve({ Y });
    };
  });

  worker.postMessage({
    N, area, type: 'fill_rect'
  });

  return promise;
}