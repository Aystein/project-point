


import { Engine } from '../../ts/engine/engine';
import { Mesh } from '../../ts/engine/initial-conditions/models/mesh';
import { Particles } from '../../ts/engine/initial-conditions/models/models';
import wgsl from './prefix-sum/down-pass.wgsl?raw';

let adapter: GPUAdapter | null = null;
let device: GPUDevice | null = null;


export async function requestDevice(): Promise<GPUDevice | null> {
    if (!device) {
        adapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });

        if (adapter) {
            device = await adapter.requestDevice();
        }
    }
    return device;
}

export async function TestRun() {
    await requestDevice();



    //const encoder = device.createCommandEncoder();
    //engine.compute(encoder, 0.04, [0, 0, 1]);
}
