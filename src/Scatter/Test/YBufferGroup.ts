import { YBuffer } from './YBuffer';

export class YBufferGroup {
  constructor(protected buffers: YBuffer[]) {}

  bind(pass: GPURenderPassEncoder) {
    this.buffers.forEach((buffer, slot) => {
      pass.setVertexBuffer(slot, buffer._buffer);
    });
  }

  get layout() {
    return this.buffers.map((buffer) => {
      return buffer._layout;
    });
  }
}

export function createYBufferGroup(...buffers: YBuffer[]) {
  return new YBufferGroup(buffers);
}
