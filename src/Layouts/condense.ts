import { showNotification, updateNotification } from '@mantine/notifications';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { VectorLike } from '../Interfaces';

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

  return new Promise<VectorLike[]>((resolve) => {
    worker.onmessage = ({
      data: { type, Y },
    }: {
      data: { Y: VectorLike[]; type: string };
    }) => {
      switch (type) {
        case 'finish':
          resolve(Y);

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

export function runCondenseLayout(n: number, area: IRectangle) {
  return runLayout(
    { n, area },
    new Worker(new URL('../Workers/condense.worker.ts', import.meta.url))
  );
}

export function runGroupLayout(X, area: IRectangle, feature: string) {
  return runLayout(
    { X, area, feature },
    new Worker(new URL('../Workers/group.worker.ts', import.meta.url))
  );
}

export function runUMAPLayout(X, N, D, area) {
  return runLayout(
    { X, N, D, area },
    new Worker(new URL('../Workers/test.ts', import.meta.url))
  );
}
