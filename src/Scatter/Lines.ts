import { defaultAlphaBlend } from './Test/Blending';
import { YBuffer, createYBuffer } from './Test/YBuffer';
import { YBufferGroup, createYBufferGroup } from './Test/YBufferGroup';
import wgsl from './Line.render.wgsl?raw';
import linewgsl from './Line.render.wgsl?raw';

export class Lines {
  lineBuffer: YBuffer;

  bufferGroup: YBufferGroup;

  renderPipeline: GPURenderPipeline;

  disposed = false;

  requested = false;

  constructor(
    public N: number,
    protected context: GPUCanvasContext,
    protected device: GPUDevice
  ) {}

  createLinePipeline(multisample: number) {
  }

  draw() {
  }
}
