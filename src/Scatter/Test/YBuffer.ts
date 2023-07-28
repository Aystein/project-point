import keys from 'lodash/keys';

const sizeOf = {
  uint32: 4,
  float32: 4,
  float32x2: 8,
  float32x4: 16,
};

interface CreateBufferConfig {
  device: GPUDevice;
  n: number;
  stepMode: GPUVertexStepMode;
  layout: { [key: number]: GPUVertexFormat };
  usage: number;
}

export function createYBuffer(config: CreateBufferConfig) {
  const { device, n, stepMode, layout, usage } = config;

  const buffer = new YBuffer(device, stepMode, layout).create(n, usage);

  return buffer;
}

export class YBuffer {
  _layout: GPUVertexBufferLayout;

  _buffer: GPUBuffer;

  constructor(
    protected device: GPUDevice,
    protected _stepMode: GPUVertexStepMode,
    layoutConfig?: { [key: number]: GPUVertexFormat }
  ) {
    if (layoutConfig) {
      this.layout = layoutConfig;
    }
  }

  create(n: number, usage: number) {
    this._buffer = this.device.createBuffer({
      size: n * this._layout.arrayStride,
      usage,
    });

    return this;
  }

  set layout(dict: { [key: number]: GPUVertexFormat }) {
    const arrayStride = Object.values(dict).reduce((previous, format) => {
      return previous + sizeOf[format];
    }, 0);

    const sortedKeys = keys(dict).sort();

    let offset = 0;

    this._layout = {
      arrayStride,
      stepMode: this._stepMode,
      attributes: sortedKeys.map((key) => {
        return {
          format: dict[key],
          shaderLocation: Number.parseInt(key),
          offset: (offset += sizeOf[dict[key]]) - sizeOf[dict[key]],
        };
      }),
    };
  }
}
