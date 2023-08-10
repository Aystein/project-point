@group(0) @binding(0) var<storage,read> initialPositions: array<ForcePosition>;
@group(0) @binding(1) var<storage,read_write> particlesBuffer: array<Particle>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

override workgroupSize: i32;

struct ComputeIn {
    @builtin(global_invocation_id) globalInvocationId : vec3<u32>,
};

@compute @workgroup_size(workgroupSize)
fn main(in: ComputeIn) {
    let particleId = in.globalInvocationId.x;
    if (particleId >= uniforms.particlesCount) {
        return;
    }

    var particle = particlesBuffer[particleId];
    var initialParticle = initialPositions[particle.index];

    particle.force = initialParticle.force;

    particlesBuffer[particleId] = particle;
}