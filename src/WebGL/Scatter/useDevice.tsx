import * as React from 'react';

/**
 * Hook that returns the device and adapter.
 */
export function useDevice() {
  const [value, setValue] = React.useState<[GPUDevice, GPUAdapter]>(null);

  React.useEffect(() => {
    (async () => {
      if (!navigator.gpu) {
        throw new Error('WebGPU not supported on this browser.');
      }
      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        throw new Error('No appropriate GPUAdapter found.');
      }

      const device = await adapter.requestDevice();

      setValue([device, adapter]);
    })();
  }, []);

  return value ?? [null, null];
}
