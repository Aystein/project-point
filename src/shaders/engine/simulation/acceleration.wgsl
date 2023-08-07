@group(0) @binding(0) var<storage,read_write> particlesBuffer: array<Particle>;
@group(0) @binding(1) var<storage,read> cellsBuffer: array<Cell>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

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
    let particleId = in.globalInvocationId.x;
    if (particleId >= uniforms.particlesCount) {
        return;
    }

    var particle = particlesBuffer[particleId];
    if (particle.weight >= uniforms.weightThreshold) {
        return;
    }

    particle.acceleration = vec2<f32>(0);

    let cellId = computeCellId(particle.position.xy);
    let minNeighbourCellId = vec2<u32>(max(cellId - 1, vec2<i32>(0)));
    let maxNeighbourCellId = vec2<u32>(min(cellId + 1, uniforms.gridSize - 1));
    var neighbourCellId: vec2<u32>;
    for (neighbourCellId.y = minNeighbourCellId.y; neighbourCellId.y <= maxNeighbourCellId.y; neighbourCellId.y++) {
        for (neighbourCellId.x = minNeighbourCellId.x; neighbourCellId.x <= maxNeighbourCellId.x; neighbourCellId.x++) {
            let neighbourCellIndex = dot(neighbourCellId, uniforms.cellsStride);
            let neighbourCell = cellsBuffer[neighbourCellIndex];

            let neighbourStartIndex = neighbourCell.offset;
            let neighbourEndIndex = neighbourCell.offset + neighbourCell.particlesCount; // exclusive
            for (var neighbourIndex = neighbourStartIndex; neighbourIndex < neighbourEndIndex; neighbourIndex++) {
                if (neighbourIndex != particleId) {
                    let neighbour = particlesBuffer[neighbourIndex];
                    let fromVector = particle.position - neighbour.position;
                    let distance = length(fromVector);
                    
                    let penetration = 2.0 * uniforms.particleRadius - distance;

                    if (penetration > 0.0) {
                        particle.acceleration += (0.96 * neighbour.weight / (particle.weight + neighbour.weight)) * penetration * normalize(fromVector) / uniforms.dt;
                    }
                }
            }
        }
    }

    // particle.acceleration += uniforms.gravity;
    // particle.acceleration += vec2f(0, 1);

    // force X
    // force Y
    let forceXDirection = particle.forceX - particle.position;
    particle.acceleration += normalize(forceXDirection) * 0.2;

    let forceYDirection = particle.forceY - particle.position;
    particle.acceleration += normalize(forceYDirection) * 0.2;

    // upper bound
    let upperBoundPenetration = particle.position - uniforms.upperBound;
    let upperBoundCheck = step(vec2<f32>(0), upperBoundPenetration); // 1 if out of bounds, 0 if in bounds
    particle.acceleration -= upperBoundCheck * (2.0 * upperBoundPenetration) / uniforms.dt;

    // lower bound
    let lowerBoundPenetration = uniforms.lowerBound - particle.position;
    let lowerBoundCheck = step(vec2<f32>(0), lowerBoundPenetration); // 1 if out of bounds, 0 if in bounds
    particle.acceleration += lowerBoundCheck * (2.0 * lowerBoundPenetration) / uniforms.dt;

    particlesBuffer[particleId] = particle;
}
