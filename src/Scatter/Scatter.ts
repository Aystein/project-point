import image from '../Assets/square_white.png';
import { POINT_RADIUS } from '../Layouts/Globals';
import { SettingsType } from '../Store/SettingsSlice';
import { Engine } from '../ts/engine/engine';
import { WebGPUBuffer } from '../ts/webgpu-utils/webgpu-buffer';
import { ShaderModule } from '../ts/webgpu-utils/webgpu-shader-module';
import linewgsl from './Line.render.wgsl?raw';
import wgsl from './Scatter.render.wgsl?raw';
import { defaultAlphaBlend } from './Test/Blending';
import { YBuffer, createYBuffer } from './Test/YBuffer';
import { YBufferGroup, createYBufferGroup } from './Test/YBufferGroup';
import { createDefaultTexture } from './TextureGeneration';
import { createQuadBuffer } from './Util';

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

  return webGPUTextureFromImageBitmapOrCanvas(gpuDevice, await createDefaultTexture());
}

export class Scatter {
  pointRenderPipeline: GPURenderPipeline;

  pointBindGroup: GPUBindGroup;

  lineBindGroup: GPUBindGroup;

  texture: GPUTexture;

  pointBufferGroup: YBufferGroup;

  lineBufferGroup: YBufferGroup;

  lineRenderPipeline: GPURenderPipeline;

  lineBuffer: YBuffer;

  multisample = 1;

  multisampleTexture;

  multisampleView;

  buffers: {
    color: WebGPUBuffer;
    shape: YBuffer;

    uniform: GPUBuffer;
    hover: WebGPUBuffer;
    selection: WebGPUBuffer;
  };

  engine: Engine;

  requested = false;

  disposed = false;

  fullyLoaded = false;

  indexBuffer;

  constructor(
    public N: number,
    protected context: GPUCanvasContext,
    protected config: ScatterConfig,
    protected device: GPUDevice,
    x: number[],
    y: number[],
  ) {
    this.engine = new Engine(device, N, {
      spheresRadius: POINT_RADIUS,
      particlesPositions: Array.from({ length: N }).map((_, i) => ([x[i], y[i]]))
    })
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

  setColor(data: Uint32Array) {
    const {
      device,
      buffers: { color },
    } = this;

    device.queue.writeBuffer(color.gpuBuffer, 0, data);
    this.engine.setColor(color)
  }

  setShape(data: Float32Array) {
    const {
      device,
      buffers: { shape },
    } = this;

    device.queue.writeBuffer(shape._buffer, 0, data);
  }

  setBounds(bounds: Float32Array) {
    this.engine.setBounds(bounds);
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
    

    device.queue.writeBuffer(hover.gpuBuffer, 0, data);
    this.engine.setHover(hover)
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

    device.queue.writeBuffer(selection.gpuBuffer, 0, data);
    this.engine.setSelected(selection)
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

    this.lineBufferGroup = createYBufferGroup(this.lineBuffer);
  }

  async loadTexturesAsync() {
    this.texture = await webGPUTextureFromImageUrl(this.device, image);

    this.pointBindGroup = this.device.createBindGroup({
      layout: this.pointRenderPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: this.device.createSampler({ magFilter: 'linear', minFilter: 'linear', addressModeU: 'repeat', addressModeV: 'repeat', mipmapFilter: "linear" }),
        },
        {
          binding: 1,
          resource: this.texture.createView(),
        },
        {
          binding: 2,
          resource: { buffer: this.buffers.uniform },
        },
        {
          binding: 3,
          resource: { buffer: this.engine.particlesBuffer.gpuBuffer },
        },
      ],
    });

    this.fullyLoaded = true;
  }

  createBuffers(canvas) {
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    const { context, device } = this;

    context.configure({
      device: device,
      format: canvasFormat,
      // alphaMode: 'opaque',
      alphaMode: 'premultiplied',
    });

    this.multisampleTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.multisample,
      format: canvasFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.multisampleView = this.multisampleTexture.createView();

    this.loadTexturesAsync();

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
      n: this.N / 2,
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

    const shape = createYBuffer({
      device,
      layout: {
        4: 'float32',
      },
      n: this.N,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });

    /*const selection = createYBuffer({
      device,
      layout: {
        6: 'uint32',
      },
      n: this.N + 1000,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    });*/

    const selection = new WebGPUBuffer(this.device, {
      usage: GPUBufferUsage.VERTEX |
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_DST,
      size: this.N * 4
    })

    /** const hover = createYBuffer({
      device,
      layout: {
        5: 'float32',
      },
      n: this.N + 1000,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      stepMode: 'instance',
    }); */

    const hover = new WebGPUBuffer(this.device, {
      usage: GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
        size: this.N * 4
    })

    const colorBuffer = new WebGPUBuffer(this.device, {
      usage: GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST,
      size: this.N * 4
    })

    device.queue.writeBuffer(colorBuffer.gpuBuffer, 0, new Float32Array(Array.from({ length: this.N }).map(() => 0xffffffff)))


    const cellShaderModule = ShaderModule.create(device, {
      code: wgsl,
      structs: [Engine.particleStructType],
    })


    this.pointBufferGroup = createYBufferGroup(
      vertexBuffer,
    );

    this.pointRenderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: cellShaderModule,
        entryPoint: 'vertexMain',
        buffers: [...this.pointBufferGroup.layout],
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
      multisample: { count: this.multisample },
    });

    this.buffers = {
      color: colorBuffer,
      shape,
      uniform: uniformBuffer,
      hover,
      selection,
    };

    // TEST
    //const indexBuffer = this.device.createBuffer({
    //  size: 2 * 10,
    //  usage: GPUBufferUsage.INDEX |
    //   GPUBufferUsage.COPY_DST,
    //});

    //device.queue.writeBuffer(indexBuffer, 0, new Uint16Array(Array.from({ length: 10 }).map((_, i) => (i))))
    //this.indexBuffer = indexBuffer;

    this.createLinePipeline();
  }

  createLinePipeline() {
    const { context, device, N } = this;

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    this.lineBuffer = createYBuffer({
      n: 100000,
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

    this.lineBufferGroup = createYBufferGroup(this.lineBuffer);

    const cellShaderModule = ShaderModule.create(device, {
      code: linewgsl,
      structs: [Engine.particleStructType],
    })

    this.lineRenderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: cellShaderModule,
        entryPoint: 'vertexMain',
        buffers: this.lineBufferGroup.layout,
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
                dstFactor: 'zero',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one',
                operation: 'max',
              },
            },
          },
        ],
      },
      primitive: {
        topology: 'triangle-list'
      },
      multisample: { count: this.multisample },
    });

    this.lineBindGroup = device.createBindGroup({
      layout: this.lineRenderPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.engine.particlesBuffer.gpuBuffer },
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

  frame(settings: SettingsType) {
    this.requested = false;

    if (!this.fullyLoaded || this.context.getCurrentTexture().width === 0 || this.context.getCurrentTexture().height === 0) {
      this.requestFrame(settings);
      return;
    }

    const encoder = this.device.createCommandEncoder();

    const { context, pointRenderPipeline: cellPipeline } = this;

    for (let i = 0; i < settings.substeps; i++) {
      this.engine.compute(encoder, settings.delta / 1000000, settings.radiusScaling)
    }

    let pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.multisample === 1 ? context.getCurrentTexture().createView() : this.multisampleView,
          resolveTarget: this.multisample === 1 ? undefined : context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: this.multisample === 1 ? 'store' : 'store',

        },
      ],
    });

    if (this.lineBuffer._buffer.size !== 0) {
      pass.setPipeline(this.lineRenderPipeline);

      this.lineBufferGroup.bind(pass);
      // pass.setVertexBuffer(2, this.buffers.color._buffer);
      pass.setBindGroup(0, this.lineBindGroup);

      pass.draw(6, this.lineBuffer._buffer.size / 8);
    }

    pass.end();

    pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.multisample === 1 ? context.getCurrentTexture().createView() : this.multisampleView,
          resolveTarget: this.multisample === 1 ? undefined : context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: 'load',
          storeOp: 'store',
        },
      ],
    })

    pass.setPipeline(cellPipeline);

    this.pointBufferGroup.bind(pass);
    pass.setVertexBuffer(5, this.engine.particlesBuffer.gpuBuffer);
    //pass.setIndexBuffer(this.indexBuffer, "uint16");

    pass.setBindGroup(0, this.pointBindGroup);

    pass.draw(6, this.N + this.engine.dynamicSize);
    //pass.drawIndexed(6, 10)

    pass.end();

    this.device.queue.submit([encoder.finish()])
  }

  requestFrame(settings) {
    if (this.requested) return;

    this.requested = true;

    requestAnimationFrame(() => {
      if (this.disposed) {
        return;
      }

      this.frame(settings);
    })
  }

  startLoop(settingsRef) {
    this.requested = true;

    const tick = () => {
      if (this.disposed) {
        return;
      }

      this.frame(settingsRef.current);

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}
