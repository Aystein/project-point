import * as glMatrix from "gl-matrix";
import * as ShaderSources from "../../shader-sources";
import * as WebGPU from "../../webgpu-utils/webgpu-utils";
import { ParticlesBufferData } from "../engine";
import { type CellsBufferData } from "./indexing";

type Data = {
    particlesBufferData: ParticlesBufferData,
    cellsBufferData: CellsBufferData,
    gridSize: glMatrix.ReadonlyVec2,
    cellSize: number,
    indexBuffer: WebGPU.Buffer,
};

type ResetResult = {
    workgroupsCount: number;
    bindgroup: GPUBindGroup;
};

class ReorderParticles {
    private static readonly WORKGROUP_SIZE: number = 256;

    private readonly device: GPUDevice;
    private readonly uniforms: WebGPU.Uniforms;
    private readonly pipeline: GPUComputePipeline;

    private workgroupsCount: number;
    private bindgroup: GPUBindGroup;

    private indexBuffer: WebGPU.Buffer;

    public constructor(device: GPUDevice, data: Data) {
        this.device = device;

        this.indexBuffer = data.indexBuffer;

        this.uniforms = new WebGPU.Uniforms(device, [
            { name: "gridSize", type: WebGPU.Types.vec2I32 },
            { name: "cellSize", type: WebGPU.Types.f32 },
            { name: "cellsStride", type: WebGPU.Types.vec2U32 },
            { name: "particlesCount", type: WebGPU.Types.u32 },
        ]);

        this.pipeline = device.createComputePipeline({
            layout: "auto",
            compute: {
                module: WebGPU.ShaderModule.create(device, {
                    code: ShaderSources.Engine.Indexing.ReorderParticles,
                    structs: [data.cellsBufferData.cellStructType, data.particlesBufferData.particlesStructType, this.uniforms],
                }),
                entryPoint: "main",
                constants: {
                    workgroupSize: ReorderParticles.WORKGROUP_SIZE,
                },
            },
        });

        const resetResult = this.applyReset(data);
        this.workgroupsCount = resetResult.workgroupsCount;
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
        const resetResult = this.applyReset(data);
        this.workgroupsCount = resetResult.workgroupsCount;
        this.bindgroup = resetResult.bindgroup;
    }

    private applyReset(data: Data): ResetResult {
        this.uniforms.setValueFromName("gridSize", data.gridSize);
        this.uniforms.setValueFromName("cellSize", data.cellSize);
        this.uniforms.setValueFromName("cellsStride", [1, data.gridSize[0]]);
        this.uniforms.setValueFromName("particlesCount", data.particlesBufferData.particlesCount);
        this.uniforms.uploadToGPU();

        const workgroupsCount = Math.ceil(data.particlesBufferData.particlesCount / ReorderParticles.WORKGROUP_SIZE);

        if (!data.particlesBufferData.particlesBuffer.hasUsage(GPUBufferUsage.COPY_DST)) {
            throw new Error();
        }

        const bindgroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: data.particlesBufferData.particlesBuffer.bindingResource,
                },
                {
                    binding: 1,
                    resource: data.cellsBufferData.cellsBuffer.bindingResource,
                },
                {
                    binding: 3,
                    resource: this.uniforms.bindingResource,
                },
                {
                    binding: 5,
                    resource: this.indexBuffer.bindingResource,
                }
            ]
        });

        return { workgroupsCount, bindgroup };
    }
}

export {
    ReorderParticles,
};

