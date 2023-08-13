@group(0) @binding(0) var<storage,read> inputParticlesBuffer: array<Particle>;
@group(0) @binding(1) var<storage,read> cellsBuffer: array<Cell>;
@group(0) @binding(2) var<storage,read_write> outputParticlesBuffer: array<Particle>;
@group(0) @binding(3) var<uniform> uniforms: Uniforms;

override workgroupSize: i32;

struct ComputeIn {
    @builtin(global_invocation_id) globalInvocationId : vec3<u32>,
};

fn computeCellId(position: vec2<f32>) -> vec2<i32> {
    let naiveCellId = vec2<i32>(position / uniforms.cellSize);
    return clamp(naiveCellId, vec2<i32>(0), uniforms.gridSize - 1);
}

fn computeCellIndex(position: vec2<f32>) -> u32 {
    let cellId = computeCellId(position);
    return dot(vec2<u32>(cellId), uniforms.cellsStride);
}

@compute @workgroup_size(workgroupSize)
fn main(in: ComputeIn) {
    let particleIndex = in.globalInvocationId.x;

    if (particleIndex < uniforms.particlesCount) {
        let particle = inputParticlesBuffer[particleIndex];

        let cellIndex: u32 = computeCellIndex(particle.position.xy);
        let cellOffset = cellsBuffer[cellIndex].offset;

        let finalParticleIndex = cellOffset + particle.indexInCell;
        
        // indexBuffer[finalParticleIndex] = particle.index;
        outputParticlesBuffer[finalParticleIndex] = particle;
    }
}
