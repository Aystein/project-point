import * as glMatrix from "gl-matrix";
import * as ShaderSources from "../../shader-sources";
import * as WebGPU from "../../webgpu-utils/webgpu-utils";
import { ParticlesBufferData } from "../engine";

type Data = {
    particlesPositions: ReadonlyArray<glMatrix.ReadonlyVec2>;
    particlesBufferData: ParticlesBufferData;
    indexBuffer: WebGPU.Buffer;
};

type ResetResult = {
    workgroupsCount: number;
    positionsBuffer: WebGPU.Buffer;
    bindgroup: GPUBindGroup;
};

class Initialization {
    private static readonly WORKGROUP_SIZE: number = 256;

    private static readonly initialParticleStructType: WebGPU.Types.StructType = new WebGPU.Types.StructType("InitialParticle", [
        { name: "position", type: WebGPU.Types.vec2F32 },
        { name: "index", type: WebGPU.Types.u32 }
    ]);

    private readonly device: GPUDevice;

    private readonly uniforms: WebGPU.Uniforms;

    private readonly pipeline: GPUComputePipeline;

    private workgroupsCount: number;

    private positionsBuffer: WebGPU.Buffer;

    private bindgroup: GPUBindGroup;

    private indexBuffer: WebGPU.Buffer;


    public constructor(device: GPUDevice, data: Data) {
        this.device = device;

        this.uniforms = new WebGPU.Uniforms(device, [
            { name: "particlesCount", type: WebGPU.Types.u32 },
        ]);

        this.indexBuffer = data.indexBuffer;

        this.pipeline = device.createComputePipeline({
            layout: "auto",
            compute: {
                module: WebGPU.ShaderModule.create(device, {
                    code: ShaderSources.Engine.Simulation.Initialization,
                    structs: [data.particlesBufferData.particlesStructType, this.uniforms, Initialization.initialParticleStructType],
                }),
                entryPoint: "main",
                constants: {
                    workgroupSize: Initialization.WORKGROUP_SIZE,
                },
            },
        });

        const resetResult = this.applyReset(data);
        this.workgroupsCount = resetResult.workgroupsCount;
        this.positionsBuffer = resetResult.positionsBuffer;
        this.bindgroup = resetResult.bindgroup;
    }

    public compute(commandEncoder: GPUCommandEncoder): void {
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.pipeline);
        computePass.setBindGroup(0, this.bindgroup);
        computePass.dispatchWorkgroups(this.workgroupsCount);
        computePass.end();
    }

    public reset(data: Data): void {
        this.positionsBuffer.free();

        const resetResult = this.applyReset(data);
        this.workgroupsCount = resetResult.workgroupsCount;
        this.positionsBuffer = resetResult.positionsBuffer;
        this.bindgroup = resetResult.bindgroup;
    }

    private applyReset(data: Data): ResetResult {
        if (data.particlesBufferData.particlesCount !== (data.particlesPositions.length)) {
            throw new Error();
        }

        const workgroupsCount = Math.ceil(data.particlesBufferData.particlesCount / Initialization.WORKGROUP_SIZE);

        this.uniforms.setValueFromName("particlesCount", data.particlesBufferData.particlesCount);
        this.uniforms.uploadToGPU();

        const positionsBuffer = new WebGPU.Buffer(this.device, {
            size: Initialization.initialParticleStructType.size * (data.particlesPositions.length),
            usage: GPUBufferUsage.STORAGE,
        });
        const positionsData = positionsBuffer.getMappedRange();

        data.particlesPositions.forEach((position: glMatrix.ReadonlyVec2, index: number) => {
            const offset = index * Initialization.initialParticleStructType.size;
            Initialization.initialParticleStructType.setValue(positionsData, offset, {
                position,
                index
            });
        });
        positionsBuffer.unmap();

        const bindgroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: positionsBuffer.bindingResource,
                },
                {
                    binding: 1,
                    resource: data.particlesBufferData.particlesBuffer.bindingResource,
                },
                {
                    binding: 2,
                    resource: this.uniforms.bindingResource,
                },
                {
                    binding: 3,
                    resource: this.indexBuffer.bindingResource,
                },
            ]
        });

        return { workgroupsCount, positionsBuffer, bindgroup };
    }
}

export {
    Initialization,
};

