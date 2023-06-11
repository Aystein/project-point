export function createQuadBuffer() {
  const vertices = new Float32Array([
    -1, -1,

    0, 1,

    1, -1,

    1, 1,

    1, 1,

    1, 0,

    -1, -1,

    0, 1,

    1, 1,

    1, 0,

    -1, 1,

    0, 0,
  ]);

  return vertices;
}

export async function requestDevice() {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported on this browser.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
  }

  return adapter.requestDevice();
}
