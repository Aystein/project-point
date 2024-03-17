import * as glMatrix from "gl-matrix";
import * as ShaderSources from "../../shader-sources";
import * as WebGPU from "../../webgpu-utils/webgpu-utils";
import { ParticlesBufferData } from "../engine";

type Data = {
    particlesPositions: ReadonlyArray<glMatrix.ReadonlyVec2>;
    particlesBufferData: ParticlesBufferData;
};

type ResetResult = {
    workgroupsCount: number;
    positionsBuffer: WebGPU.Buffer;
    bindgroup: GPUBindGroup;
};

export class SetPositions {
    private static readonly WORKGROUP_SIZE: number = 256;

    private static readonly setForceStructType: WebGPU.Types.StructType = new WebGPU.Types.StructType("ForcePosition", [
        { name: "force", type: WebGPU.Types.vec2F32 },
    ]);

    private readonly device: GPUDevice;

    private readonly uniforms: WebGPU.Uniforms;

    private readonly pipeline: GPUComputePipeline;

    private workgroupsCount: number;

    private bindgroup: GPUBindGroup;

    public constructor(device: GPUDevice, data: Data) {
        this.device = device;

        this.uniforms = new WebGPU.Uniforms(device, [
            { name: "particlesCount", type: WebGPU.Types.u32 },
        ]);

        this.pipeline = device.createComputePipeline({
            layout: "auto",
            compute: {
                module: WebGPU.ShaderModule.create(device, {
                    code: ShaderSources.Engine.Simulation.SetPositions,
                    structs: [data.particlesBufferData.particlesStructType, this.uniforms, SetPositions.setForceStructType],
                }),
                entryPoint: "main",
                constants: {
                    workgroupSize: SetPositions.WORKGROUP_SIZE,
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

    private applyReset(data: Data): ResetResult {
        if (data.particlesBufferData.particlesCount !== (data.particlesPositions.length)) {
            throw new Error();
        }

        const workgroupsCount = Math.ceil(data.particlesBufferData.particlesCount / SetPositions.WORKGROUP_SIZE);

        this.uniforms.setValueFromName("particlesCount", data.particlesBufferData.particlesCount);
        this.uniforms.uploadToGPU();

        const positionsBuffer = new WebGPU.Buffer(this.device, {
            size: SetPositions.setForceStructType.size * (data.particlesPositions.length),
            usage: GPUBufferUsage.STORAGE,
        });

        const positionsData = positionsBuffer.getMappedRange();

        data.particlesPositions.forEach((position: glMatrix.ReadonlyVec2, index: number) => {
            const offset = index * SetPositions.setForceStructType.size;
            SetPositions.setForceStructType.setValue(positionsData, offset, {
                force: position,
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
            ]
        });

        return { workgroupsCount, positionsBuffer, bindgroup };
    }
}
