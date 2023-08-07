@group(0) @binding(0) var<storage,read_write> particlesBuffer: array<Particle>;

fn map(x: f32, in_min: f32, in_max: f32, out_min: f32, out_max: f32) -> f32
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

struct VertexInput {
    @builtin(instance_index) instance: u32,
    @builtin(vertex_index) vert: u32,
};
  
struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f,
};


@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
    var output: VertexOutput;

    output.color = vec4f(1, 0, 0, 1);

    return output;
}

struct FragInput {
    @location(0) color: vec4f,
};

@fragment
fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}