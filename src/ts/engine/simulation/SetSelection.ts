import * as glMatrix from "gl-matrix";
import * as ShaderSources from "../../shader-sources";
import * as WebGPU from "../../webgpu-utils/webgpu-utils";
import { ParticlesBufferData } from "../engine";

type Data = {
    particlesPositions: number[];
    particlesBufferData: ParticlesBufferData;
};

type ResetResult = {
    workgroupsCount: number;
    positionsBuffer: WebGPU.Buffer;
    bindgroup: GPUBindGroup;
};

export class SetSelection {
    private static readonly WORKGROUP_SIZE: number = 256;
    public static readonly PARTICLE_WEIGHT_WATER: number = 1;
    public static readonly PARTICLE_WEIGHT_THRESHOLD: number = 10;
    public static readonly PARTICLE_WEIGHT_OBSTACLE: number = 100000;

    private static readonly setForceStructType: WebGPU.Types.StructType = new WebGPU.Types.StructType("ForceSelect", [
        { name: "selected", type: WebGPU.Types.u32 },
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
                    code: ShaderSources.Engine.Simulation.SetSelection,
                    structs: [data.particlesBufferData.particlesStructType, this.uniforms, SetSelection.setForceStructType],
                }),
                entryPoint: "main",
                constants: {
                    workgroupSize: SetSelection.WORKGROUP_SIZE,
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

        const workgroupsCount = Math.ceil(data.particlesBufferData.particlesCount / SetSelection.WORKGROUP_SIZE);

        this.uniforms.setValueFromName("particlesCount", data.particlesBufferData.particlesCount);
        this.uniforms.uploadToGPU();

        const positionsBuffer = new WebGPU.Buffer(this.device, {
            size: SetSelection.setForceStructType.size * (data.particlesPositions.length),
            usage: GPUBufferUsage.STORAGE,
        });

        const positionsData = positionsBuffer.getMappedRange();


        data.particlesPositions.forEach((position: number, index: number) => {
            const offset = index * SetSelection.setForceStructType.size;
            
            SetSelection.setForceStructType.setValue(positionsData, offset, {
                selected: position,
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
