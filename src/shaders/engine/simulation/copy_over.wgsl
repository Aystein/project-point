@group(0) @binding(0) var<storage,read> instructions: array<Instruction>;
@group(0) @binding(1) var<storage,read_write> particlesBuffer: array<Particle>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

override workgroupSize: i32;

struct ComputeIn {
    @builtin(global_invocation_id) globalInvocationId : vec3<u32>,
};

@compute @workgroup_size(workgroupSize)
fn main(in: ComputeIn) {
    let instructionId = in.globalInvocationId.x;
    if (instructionId >= uniforms.instructionsCount) {
        return;
    }

    var instruction = instructions[instructionId];
    particlesBuffer[instruction.target] = particlesBuffer[instruction.source];
}
