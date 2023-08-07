function throwAndDisplayException(id: string, message: string): void {
    throw new Error(message);
}

const gpu: GPU = navigator.gpu;
if (!gpu) {
    throwAndDisplayException("webgpu-support", "Your browser does not seem to support WebGPU.");
}

let adapter: GPUAdapter | null = null;
let device: GPUDevice | null = null;

async function requestDevice(): Promise<GPUDevice | null> {
    if (!device) {
        adapter = await gpu.requestAdapter({
            powerPreference: "high-performance"
        });

        if (adapter) {
            device = await adapter.requestDevice();
        } else {
            throwAndDisplayException("webgpu-adapter", "Request for GPU adapter failed.");
        }
    }
    return device;
}

export {
    adapter,
    device,
    gpu,
    requestDevice as initialize,
};
