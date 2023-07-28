import { defaultAlphaBlend } from './Test/Blending';
import { YBuffer, createYBuffer } from './Test/YBuffer';
import { YBufferGroup, createYBufferGroup } from './Test/YBufferGroup';
import wgsl from './Line.render.wgsl?raw';

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

  create() {
    const { device, N } = this;

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    this.lineBuffer = createYBuffer({
      n: N,
      layout: {
        0: 'uint32',
        1: 'uint32',
      },
      device,
      stepMode: 'instance',
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(
      this.lineBuffer._buffer,
      0,
      new Uint32Array([0, 1])
    );

    this.bufferGroup = createYBufferGroup(this.lineBuffer);

    const cellShaderModule = device.createShaderModule({
      code: wgsl,
    });

    this.renderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: cellShaderModule,
        entryPoint: 'vertexMain',
        buffers: this.bufferGroup.layout,
      },
      fragment: {
        module: cellShaderModule,
        entryPoint: 'fragmentMain',
        targets: [
          {
            format: canvasFormat,
            blend: defaultAlphaBlend(),
          },
        ],
      },
    });
  }

  dispose() {
    this.disposed = true;
  }

  frame() {
    if (this.disposed && this.requested) {
      return;
    }

    this.requested = true;

    requestAnimationFrame(() => {
      this.requested = false;

      const { device, context, renderPipeline } = this;

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: [1, 1, 1, 0],
            storeOp: 'store',
          },
        ],
      });

      pass.setPipeline(renderPipeline);

      this.bufferGroup.bind(pass);

      pass.draw(6, this.N);

      pass.end();

      const commandBuffer = encoder.finish();

      device.queue.submit([commandBuffer]);

      this.frame();
    });
  }
}
