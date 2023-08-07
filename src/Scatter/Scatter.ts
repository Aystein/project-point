import wgsl from './Scatter.render.wgsl?raw';
import linewgsl from './Line.render.wgsl?raw';
import computewgsl from './Scatter.compute.wgsl?raw';
import image from '../Assets/square_white.png';
import { createQuadBuffer } from './Util';
import { YBuffer, createYBuffer } from './Test/YBuffer';
import { defaultAlphaBlend } from './Test/Blending';
import { YBufferGroup, createYBufferGroup } from './Test/YBufferGroup';
import { POINT_RADIUS } from '../Layouts/Globals';
import { Engine, SpheresBuffer } from '../ts/engine/engine';

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

export class Scatter {
  cellPipeline: GPURenderPipeline;

  bindGroup: GPUBindGroup;

  bindGroup2: GPUBindGroup;

  texture: GPUTexture;

  computePipeline: GPUComputePipeline;

  computeBindgroup: GPUBindGroup;

  bufGroup: YBufferGroup;

  bufferGroup: YBufferGroup;

  renderPipeline: GPURenderPipeline;

  lineBuffer: YBuffer;

  sampleTexture;

  lineBindgroup;

  buffers: {
    color: YBuffer;
    vertex: YBuffer;
    particle: YBuffer;
    shape: YBuffer;

    targetPosition: GPUBuffer;
    uniform: GPUBuffer;
    hover: YBuffer;
    selection: YBuffer;
  };

  requested = false;

  disposed = false;

  interpolateBetweenFrames = true;

  constructor(
    public N: number,
    protected context: GPUCanvasContext,
    protected config: ScatterConfig,
    protected device?: GPUDevice
  ) { }

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
      buffers: { targetPosition, particle },
    } = this;

    if (this.interpolateBetweenFrames) {
      device.queue.writeBuffer(targetPosition, 0, data);
    } else {
      device.queue.writeBuffer(particle._buffer, 0, data);
    }
  }

  updateBounds(xdomain, ydomain) {
    this.device.queue.writeBuffer(
      this.buffers.uniform,
      0,
      new Float32Array([
        ...xdomain,
        ...ydomain,
        (2 / (xdomain[1] - xdomain[0])) * POINT_RADIUS,
        (2 / (ydomain[1] - ydomain[0])) * POINT_RADIUS,
      ])
    );
  }

  setColor(data: Float32Array) {
    const {
      device,
      buffers: { color },
    } = this;

    device.queue.writeBuffer(color._buffer, 0, data);
  }

  setShape(data: Float32Array) {
    const {
      device,
      buffers: { shape },
    } = this;

    device.queue.writeBuffer(shape._buffer, 0, data);
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

    device.queue.writeBuffer(hover._buffer, 0, data);
  }

  setSelection(indices: number[]) {
    const {
      device,
      buffers: { selection },
    } = this;

    const data = new Float32Array(this.N);
    data.fill(0);

    indices.forEach((i) => {
      data[i] = 1;
    });

    device.queue.writeBuffer(selection._buffer, 0, data);
  }

  setLine(line: number[]) {
    this.lineBuffer = createYBuffer({
      n: line ? line.length / 2 : 0,
      layout: {
        0: 'uint32',
        1: 'uint32',
      },
      device: this.device,
      stepMode: 'instance',
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(
      this.lineBuffer._buffer,
      0,
      new Uint32Array(line ?? [])
    );

    this.bufferGroup = createYBufferGroup(this.lineBuffer);
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
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.buffers.particle._buffer },
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

  async createBuffers(width: number, height: number) {
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    const { context, device } = this;

    context.configure({
      device: device,
      format: canvasFormat,
      // alphaMode: 'opaque',
      alphaMode: 'premultiplied',
    });

    // console.log(new URL(image));
    this.texture = await webGPUTextureFromImageUrl(device, image);

    this.sampleTexture = device.createTexture({
      size: [
        context.getCurrentTexture().width,
        context.getCurrentTexture().height,
      ],
      sampleCount: 4,
      format: navigator.gpu.getPreferredCanvasFormat(),
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Create buffer
    const uniformArray = new Float32Array([0, 2, 0, 2, 0.01, 0.01]);
    const uniformBuffer = device.createBuffer({
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    // Create vertex buffer
    const vertices = createQuadBuffer();

    const vertexBuffer = createYBuffer({
      device,
      layout: {
        0: 'float32x2',
        1: 'float32x2',
      },
      n: this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
      stepMode: 'vertex',
    });

    device.queue.writeBuffer(
      vertexBuffer._buffer,
      /*bufferOffset=*/ 0,
      vertices
    );

    const particleBuffer = createYBuffer({
      device,
      layout: {
        2: 'float32x2',
      },
      n: this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    const shape = createYBuffer({
      device,
      layout: {
        4: 'float32',
      },
      n: this.N,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    const selection = createYBuffer({
      device,
      layout: {
        6: 'uint32',
      },
      n: this.N,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    const hover = createYBuffer({
      device,
      layout: {
        5: 'float32',
      },
      n: this.N,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    const targetPosition = device.createBuffer({
      size: 8 * this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
    });

    const colorBuffer = createYBuffer({
      device,
      layout: {
        3: 'float32x4',
      },
      n: this.N,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    // Create render pipeline
    const cellShaderModule = device.createShaderModule({
      code: wgsl,
    });

    this.bufGroup = createYBufferGroup(
      vertexBuffer,
      particleBuffer,
      colorBuffer,
      shape,
      hover,
      selection
    );
    console.log(this.bufGroup.layout);
    const cellPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: cellShaderModule,
        entryPoint: 'vertexMain',
        buffers: [...this.bufGroup.layout, {
          attributes: [
              {
                  shaderLocation: 7,
                  offset: 0,
                  format: 'float32x3',
              },
          ],
          arrayStride: Engine.particleStructType.size,
          stepMode: "instance",
      }],
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
      // multisample: { count: 4 },
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: cellPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
      ],
    });

    const bindGroup2 = device.createBindGroup({
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
      selection,
    };

    this.cellPipeline = cellPipeline;
    this.bindGroup = bindGroup;
    this.bindGroup2 = bindGroup2;

    this.createComputePipeline();
    this.createLinePipeline();
  }

  createLinePipeline() {
    const { context, device, N } = this;

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    this.lineBuffer = createYBuffer({
      n: 500,
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
      new Uint32Array(Array.from({ length: 1000 }).map((_, i) => i))
    );

    this.bufferGroup = createYBufferGroup(this.lineBuffer);

    const cellShaderModule = device.createShaderModule({
      code: linewgsl,
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
      // multisample: { count: 4 },
    });

    this.lineBindgroup = device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.buffers.particle._buffer },
        },
        {
          binding: 1,
          resource: { buffer: this.buffers.uniform },
        },
      ],
    });
  }

  dispose() {
    this.disposed = true;
  }

  frame(encoder: GPUCommandEncoder, buffer: SpheresBuffer) {
    if (this.disposed) {
      return;
    }

    const { device, context, cellPipeline, bindGroup } = this;

    if (this.requested) {
      return;
    }
    this.requested = true;

    this.requested = false;



    if (this.interpolateBetweenFrames) {
      const computePass = encoder.beginComputePass();

      computePass.setPipeline(this.computePipeline);
      computePass.setBindGroup(0, this.computeBindgroup);
      computePass.dispatchWorkgroups(Math.ceil(this.N / 256));

      computePass.end();
    }

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(), // this.sampleTexture.createView(),
          // resolveTarget: context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    pass.setPipeline(this.renderPipeline);

    this.bufferGroup.bind(pass);
    pass.setBindGroup(0, this.lineBindgroup);

    pass.draw(6, this.lineBuffer._buffer.size / 8);

    pass.setPipeline(cellPipeline);

    this.bufGroup.bind(pass);
    pass.setVertexBuffer(6, buffer.gpuBuffer);

    pass.setBindGroup(0, bindGroup);
    pass.setBindGroup(1, this.bindGroup2);

    pass.draw(6, this.N);

    pass.end();

  }
}
