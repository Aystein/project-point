struct Particle {
    position: vec2<f32>
}

struct Particles {
    particles: array<Particle>
}

struct Uniforms {
    xdomain: vec2f,
    ydomain: vec2f,
    sizeX: f32,
    sizeY: f32
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;


@group(1) @binding(0) var ourSampler: sampler;
@group(1) @binding(1) var ourTexture: texture_2d<f32>;


struct VertexInput {
    @location(0) vertexPosition: vec2f,
    @location(1) texCoord: vec2f,

    @location(2) position: vec2f,
    @location(3) color: vec4f,
    @location(4) shape: f32,
    @location(5) hover: f32,

    
    @builtin(instance_index) instance: u32,
    @builtin(vertex_index) vert: u32,
};
  
struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) texCoord: vec2f,
    @location(1) color: vec4f,
};

fn map(x: f32, in_min: f32, in_max: f32, out_min: f32, out_max: f32) -> f32
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
    var output: VertexOutput;

    let dim = vec2f(2, 2);

    output.pos = vec4f(map(input.position.x, uniforms.xdomain.x, uniforms.xdomain.y, -1, 1) + input.vertexPosition.x * uniforms.sizeX, map(input.position.y, uniforms.ydomain.x, uniforms.ydomain.y, 1, -1) + input.vertexPosition.y * uniforms.sizeY, 0, 1);
    
    if (input.hover > 0.0) {
        output.color = input.color * 1.5;
    } else {
        output.color = input.color;
    }
    

    output.texCoord = (input.texCoord / dim) + vec2f(input.shape % dim.x, floor(input.shape / dim.y)) / dim;

    return output;
}

struct FragInput {
    @location(0) texCoord: vec2f,
    @location(1) color: vec4f,
};

@fragment
fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    var col = textureSample(ourTexture, ourSampler, input.texCoord);
    col = col * input.color;

    //let dist = distance(input.texCoord, vec2f(0.25, 0.25));
    //if (dist < 0.1) {
    //    col = vec4f(0, 0, 0, 1);
    //}

    return col;
}