import * as ShaderSources from "../../shader-sources";
import { WebGPUBuffer } from "../../webgpu-utils/webgpu-buffer";
import * as WebGPU from "../../webgpu-utils/webgpu-utils";
import { ParticlesBufferData } from "../engine";

type Data = {
    particlesBufferData: ParticlesBufferData;
    selectedBuffer: WebGPUBuffer;
};

type ResetResult = {
    workgroupsCount: number;
    bindgroup: GPUBindGroup;
};

export class SetSelected {
    private static readonly WORKGROUP_SIZE: number = 256;

    private static readonly setHoverStructType: WebGPU.Types.StructType = new WebGPU.Types.StructType("SelectedValue", [
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
                    code: ShaderSources.Engine.Simulation.SetSelected,
                    structs: [data.particlesBufferData.particlesStructType, this.uniforms, SetSelected.setHoverStructType],
                }),
                entryPoint: "main",
                constants: {
                    workgroupSize: SetSelected.WORKGROUP_SIZE,
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
        const workgroupsCount = Math.ceil(data.particlesBufferData.particlesCount / SetSelected.WORKGROUP_SIZE);

        this.uniforms.setValueFromName("particlesCount", data.particlesBufferData.particlesCount);
        this.uniforms.uploadToGPU();

        const bindgroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: data.selectedBuffer.bindingResource,
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

        return { workgroupsCount, bindgroup };
    }
}
