@group(0) @binding(0) var<storage,read> initialParticlesBuffer: array<InitialParticle>;
@group(0) @binding(1) var<storage,read_write> particlesBuffer: array<Particle>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;
@group(0) @binding(3) var<storage,read_write> indexBuffer: array<u32>;

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

    var initialParticle = initialParticlesBuffer[particleId];

    var particle: Particle;
    particle.position = initialParticle.position;
    particle.velocity = vec2<f32>(0);
    particle.acceleration = vec2<f32>(0);
    particle.force = vec2f(2.5, 2.5);
    particle.index = particleId;
    particle.selected = 0;
    particle.bounds = vec4f(0, 0, 20, 20);

    indexBuffer[particleId] = particleId;

    particlesBuffer[particleId] = particle;
}
