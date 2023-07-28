import { defaultAlphaBlend } from './Blending';
import { YBuffer } from './YBuffer';
import { YBufferGroup, createYBufferGroup } from './YBufferGroup';

export class YPass {
  bufferGroup: YBufferGroup;

  renderPipeline: GPURenderPipeline;

  cosntructor() {}
}

export function createYPass({
  device,
  canvasFormat,
  buffers,
  shader: { code, vertexEntry, fragmentEntry },
}: {
  device: GPUDevice;
  canvasFormat?: GPUTextureFormat;
  buffers: YBuffer[];
  shader: { code: string; vertexEntry: string; fragmentEntry: string };
}) {
  const pass = new YPass();

  const cellShaderModule = device.createShaderModule({
    code,
  });

  pass.bufferGroup = createYBufferGroup(...buffers);

  pass.renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: cellShaderModule,
      entryPoint: vertexEntry,
      buffers: this.bufGroup.layout,
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: fragmentEntry,
      targets: [
        {
          format: canvasFormat ?? navigator.gpu.getPreferredCanvasFormat(),
          blend: defaultAlphaBlend(),
        },
      ],
    },
  });
}
