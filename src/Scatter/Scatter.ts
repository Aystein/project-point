import wgsl from './Scatter.render.wgsl?raw';
import computewgsl from './Scatter.compute.wgsl?raw';
import image from '../Assets/square_white.png';
import { createQuadBuffer, requestDevice } from './Util';

export interface ScatterConfig {
  background: GPUColor;
}

function webGPUTextureFromImageBitmapOrCanvas(
  gpuDevice: GPUDevice,
  source: ImageBitmap
) {
  const textureDescriptor: GPUTextureDescriptor = {
    // Unlike in WebGL, the size of our texture must be set at texture creation time.
    // This means we have to wait until the image is loaded to create the texture, since we won't
    // know the size until then.
    size: { width: source.width, height: source.height },
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  };
  const texture = gpuDevice.createTexture(textureDescriptor);

  gpuDevice.queue.copyExternalImageToTexture(
    { source },
    { texture },
    textureDescriptor.size
  );

  return texture;
}

async function webGPUTextureFromImageUrl(gpuDevice, url) {
  // Note that this is an async function
  const response = await fetch(url);
  const blob = await response.blob();
  const imgBitmap = await createImageBitmap(blob);

  return webGPUTextureFromImageBitmapOrCanvas(gpuDevice, imgBitmap);
}

async function createScatter({
  N,
  context,
  config,
}: {
  N: number;
  context: GPUCanvasContext;
  config: ScatterConfig;
}) {
  const device = await requestDevice();

  const scatter = new Scatter(N, context, config);
}

export class Scatter {
  cellPipeline: GPURenderPipeline;

  bindGroup: GPUBindGroup;

  bindGroup2: GPUBindGroup;

  texture: GPUTexture;

  computePipeline: GPUComputePipeline;

  computeBindgroup: GPUBindGroup;

  buffers: {
    color: GPUBuffer;
    vertex: GPUBuffer;
    particle: GPUBuffer;
    shape: GPUBuffer;

    targetPosition: GPUBuffer;
    uniform: GPUBuffer;
    hover: GPUBuffer;
  };

  requested = false;

  disposed = false;

  constructor(
    public N: number,
    protected context: GPUCanvasContext,
    protected config: ScatterConfig,
    protected device?: GPUDevice
  ) {}

  async requestDevice() {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported on this browser.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No appropriate GPUAdapter found.');
    }

    this.device = await adapter.requestDevice();
  }

  setXY(data: Float32Array) {
    const {
      device,
      buffers: { targetPosition },
    } = this;

    device.queue.writeBuffer(targetPosition, 0, data);
  }

  updateBounds(xdomain, ydomain) {
    this.device.queue.writeBuffer(
      this.buffers.uniform,
      0,
      new Float32Array([
        ...xdomain,
        ...ydomain,
        (2 / (xdomain[1] - xdomain[0])) * 0.006,
        (2 / (ydomain[1] - ydomain[0])) * 0.006,
      ])
    );
  }

  setColor(data: Float32Array) {
    const {
      device,
      buffers: { color },
    } = this;

    device.queue.writeBuffer(color, 0, data);
  }

  setShape(data: Float32Array) {
    const {
      device,
      buffers: { shape },
    } = this;

    device.queue.writeBuffer(shape, 0, data);
  }

  setHover(indices: number[]) {
    const {
      device,
      buffers: { hover },
    } = this;

    const data = new Float32Array(this.N);
    data.fill(0);

    indices.forEach((i) => {
      data[i] = 1;
    });

    device.queue.writeBuffer(hover, 0, data);
  }

  createComputePipeline() {
    const { device } = this;

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: device.createShaderModule({
          code: computewgsl,
        }),
        entryPoint: 'computeMain',
      },
    });

    const computeBindgroup = device.createBindGroup({
      label: 'test bg',
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.buffers.particle },
        },
        {
          binding: 1,
          resource: { buffer: this.buffers.targetPosition },
        },
      ],
    });

    this.computeBindgroup = computeBindgroup;
    this.computePipeline = pipeline;
  }

  async createBuffers() {
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    const { context, device } = this;

    context.configure({
      device: device,
      format: canvasFormat,
      alphaMode: 'opaque',
    });

    // console.log(new URL(image));
    this.texture = await webGPUTextureFromImageUrl(device, image);

    // Create buffer
    const uniformArray = new Float32Array([0, 2, 0, 2, 0.01, 0.01]);
    const uniformBuffer = device.createBuffer({
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    // Create vertex buffer
    const vertices = createQuadBuffer();
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

    const shape = device.createBuffer({
      size: this.N * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const particleBuffer = device.createBuffer({
      size: 8 * this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
    });

    const hover = device.createBuffer({
      size: 4 * this.N,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const targetPosition = device.createBuffer({
      size: 8 * this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
    });

    const colorBuffer = device.createBuffer({
      size: 16 * this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
    });

    /**device.queue.writeBuffer(
      particleBuffer,
      0,
      new Float32Array([0.2, 0.2, 0, 0, 0, 0])
    );**/

    // Create render pipeline
    const cellShaderModule = device.createShaderModule({
      label: 'Cell shader',
      code: wgsl,
    });

    const cellPipeline = device.createRenderPipeline({
      label: 'Cell pipeline',
      layout: 'auto',
      vertex: {
        module: cellShaderModule,
        entryPoint: 'vertexMain',
        buffers: [
          {
            arrayStride: 16,
            attributes: [
              {
                format: 'float32x2',
                offset: 0,
                shaderLocation: 0, // Position, see vertex shader
              },
              {
                format: 'float32x2',
                offset: 8,
                shaderLocation: 1,
              },
            ],
          },
          {
            arrayStride: 8,
            stepMode: 'instance',
            attributes: [
              {
                format: 'float32x2',
                offset: 0,
                shaderLocation: 2,
              },
            ],
          },
          {
            arrayStride: 16,
            stepMode: 'instance',
            attributes: [
              {
                format: 'float32x4',
                offset: 0,
                shaderLocation: 3,
              },
            ],
          },
          {
            arrayStride: 4,
            stepMode: 'instance',
            attributes: [
              {
                format: 'float32',
                offset: 0,
                shaderLocation: 4,
              },
            ],
          },
          {
            arrayStride: 4,
            stepMode: 'instance',
            attributes: [
              {
                format: 'float32',
                offset: 0,
                shaderLocation: 5,
              },
            ],
          },
        ],
      },
      fragment: {
        module: cellShaderModule,
        entryPoint: 'fragmentMain',
        targets: [
          {
            format: canvasFormat,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one',
                operation: 'add',
              },
            },
          },
        ],
      },
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      label: 'Cell renderer bind group',
      layout: cellPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
      ],
    });

    const bindGroup2 = device.createBindGroup({
      label: 'Cell renderer bind',
      layout: cellPipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 0,
          resource: device.createSampler(),
        },
        {
          binding: 1,
          resource: this.texture.createView(),
        },
      ],
    });

    this.buffers = {
      color: colorBuffer,
      vertex: vertexBuffer,
      particle: particleBuffer,
      targetPosition,
      shape,
      uniform: uniformBuffer,
      hover,
    };

    this.cellPipeline = cellPipeline;
    this.bindGroup = bindGroup;
    this.bindGroup2 = bindGroup2;

    this.createComputePipeline();
  }

  dispose() {
    this.disposed = true;
  }

  frame() {
    if (this.disposed) {
      return;
    }

    const {
      device,
      context,
      cellPipeline,
      bindGroup,
      buffers: { particle, color, vertex, shape, hover },
    } = this;

    if (this.requested) {
      return;
    }
    this.requested = true;

    requestAnimationFrame(() => {
      this.requested = false;

      const encoder = device.createCommandEncoder();

      const computePass = encoder.beginComputePass();

      computePass.setPipeline(this.computePipeline);
      computePass.setBindGroup(0, this.computeBindgroup);
      computePass.dispatchWorkgroups(Math.ceil(this.N / 256));

      computePass.end();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: this.config.background, // New line
            storeOp: 'store',
          },
        ],
      });

      pass.setPipeline(cellPipeline);
      pass.setVertexBuffer(0, vertex);
      pass.setVertexBuffer(1, particle);
      pass.setVertexBuffer(2, color);
      pass.setVertexBuffer(3, shape);
      pass.setVertexBuffer(4, hover);
      pass.setBindGroup(0, bindGroup);
      pass.setBindGroup(1, this.bindGroup2);

      pass.draw(6, this.N);

      pass.end();

      const commandBuffer = encoder.finish();

      device.queue.submit([commandBuffer]);

      this.frame();
    });
  }
}
