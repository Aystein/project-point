import { Engine, ParticlesBufferData } from "../../../ts/engine/engine";
import { ShaderModule } from "../../../ts/webgpu-utils/webgpu-shader-module";
import hovergsl from './hover.wgsl?raw';
import * as WebGPU from "../../../ts/webgpu-utils/webgpu-utils";

type ResetResult = {
    hoverBuffer: WebGPU.Buffer;
    bindgroup: GPUBindGroup;
    workgroupsCount: number;
};

type Data = {
    particlesBufferData: ParticlesBufferData;
};

export class Hover {
    private static readonly WORKGROUP_SIZE: number = 256;

    private static readonly hoverStructType: WebGPU.Types.StructType = new WebGPU.Types.StructType("HoverDistance", [
        { name: "force", type: WebGPU.Types.vec2F32 },
    ]);

    private readonly device: GPUDevice;

    private readonly uniforms: WebGPU.Uniforms;

    private readonly pipeline: GPUComputePipeline;

    private workgroupsCount: number;

    private bindgroup: GPUBindGroup;

    private hoverBuffer: WebGPU.Buffer;

    private copy: WebGPU.Buffer;

    public constructor(device: GPUDevice, data: ParticlesBufferData) {
        this.device = device;

        this.uniforms = new WebGPU.Uniforms(device, [
            { name: "particlesCount", type: WebGPU.Types.u32 },
            { name: "mousePosition", type: WebGPU.Types.vec2F32 }
        ]);

        this.pipeline = device.createComputePipeline({
            layout: "auto",
            compute: {
                module: ShaderModule.create(device, {
                    code: hovergsl,
                    structs: [Engine.particleStructType, this.uniforms],
                }),
                entryPoint: "main",
            },
        });

        const resetResult = this.applyReset(data);
        this.bindgroup = resetResult.bindgroup;
        this.workgroupsCount = resetResult.workgroupsCount;
        this.hoverBuffer = resetResult.hoverBuffer;
        this.copy = new WebGPU.Buffer(this.device, {
            size: 8,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        })
    }

    public setMousePosition(position: number[]) {
        this.uniforms.setValueFromName("mousePosition", position);
        this.uniforms.uploadToGPU();
    }

    public compute(commandEncoder: GPUCommandEncoder, mousePosition: number[]): void {
        this.uniforms.setValueFromName("mousePosition", mousePosition)
        this.device.queue.writeBuffer(this.hoverBuffer.gpuBuffer, 0, new Uint32Array([Number.MAX_SAFE_INTEGER, -1]))

        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.pipeline);
        computePass.setBindGroup(0, this.bindgroup);
        computePass.dispatchWorkgroups(this.workgroupsCount);
        computePass.end();
    }

    mapped = false;

    public async read() {
        if (this.mapped) {
            return;
        }
        this.mapped = true;


        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(this.hoverBuffer.gpuBuffer, 0, this.copy.gpuBuffer, 0, this.copy.size);
        this.device.queue.submit([commandEncoder.finish()]);

        await this.device.queue.onSubmittedWorkDone();

        await this.copy.gpuBuffer.mapAsync(GPUMapMode.READ, 0, this.copy.gpuBuffer.size);

        const range = new Uint32Array(this.copy.gpuBuffer.getMappedRange(0, this.copy.size).slice(0));
        this.copy.gpuBuffer.unmap();

        this.mapped = false;

        return range;
    }

    private applyReset(data: ParticlesBufferData): ResetResult {
        this.uniforms.setValueFromName("particlesCount", data.particlesCount);
        this.uniforms.setValueFromName("mousePosition", [0, 0]);
        this.uniforms.uploadToGPU();

        const hoverBuffer = new WebGPU.Buffer(this.device, {
            size: 8,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(hoverBuffer.gpuBuffer, 0, new Uint32Array([Number.MAX_SAFE_INTEGER, 0]))


        const bindgroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: hoverBuffer.bindingResource,
                },
                {
                    binding: 1,
                    resource: data.particlesBuffer.bindingResource,
                },
                {
                    binding: 2,
                    resource: this.uniforms.bindingResource,
                },
            ]
        });

        const workgroupsCount = Math.ceil(data.particlesCount / 128);


        return { hoverBuffer, bindgroup, workgroupsCount };
    }
}