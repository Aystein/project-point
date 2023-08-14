@group(0) @binding(0) var<storage,read_write> hoverBuffer: array<atomic<u32>>;
@group(0) @binding(1) var<storage,read_write> particlesBuffer: array<Particle>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

struct ComputeIn {
    @builtin(global_invocation_id) globalInvocationId : vec3<u32>,
};

@compute @workgroup_size(128)
fn main(in: ComputeIn) {
    let particleId = in.globalInvocationId.x;
    var dist = 0u;

    if (particleId < uniforms.particlesCount) {
        var particle = particlesBuffer[particleId];
    
        dist = u32(distance(particle.position, uniforms.mousePosition) * 10000);

        atomicMin(&hoverBuffer[0], dist);
    }


    //workgroupBarrier();

    if (particleId < uniforms.particlesCount) {
        let loadDist = atomicLoad(&hoverBuffer[0]);
        if (loadDist == dist) {
            atomicStore(&hoverBuffer[1], particleId);
        }
    }

   // workgroupBarrier();
}