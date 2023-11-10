
struct Uniforms {
    xdomain: vec2f,
    ydomain: vec2f,
    sizeX: f32,
    sizeY: f32
}

@group(0) @binding(0) var<storage, read> hover: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) start: u32,
    @location(1) end: u32,

    @builtin(instance_index) instance: u32,
    @builtin(vertex_index) vert: u32,
}
  
struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f,
};

fn map(x: f32, in_min: f32, in_max: f32, out_min: f32, out_max: f32) -> f32
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

fn map2f(x: vec2f) -> vec2f
{
  return vec2f(map(x.x, uniforms.xdomain.x, uniforms.xdomain.y, -1, 1), map(x.y, uniforms.ydomain.x, uniforms.ydomain.y, 1, -1));
}

fn intToColor(uintc: u32) -> vec4f {
    return vec4f(f32((uintc >> 24) & 0xff) / 255, f32( (uintc >> 16) & 0xff) / 255,  f32((uintc >> 8) & 0xff) / 255, f32(uintc & 0xff));
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
    var output: VertexOutput;

    output.pos = vec4f(1.0, 1.0, 0.0, 1.0);

    var uii = uniforms;

    var startPosition = hover[input.start].position;
    var endPosition = hover[input.end].position;

    output.pos = vec4f(0.0, 0.0, 0.0, 1.0);

    var direction = startPosition - endPosition;
    var norm = normalize(vec2f(direction.y, direction.x)) * 0.0022;

    var uintc = 0u;

    if (input.vert == 0) {
        output.pos = vec4f(map2f(startPosition) - norm, 0.0, 1.0);
        uintc = hover[input.start].color;
    }
    if (input.vert == 1) {
        output.pos = vec4f(map2f(startPosition) + norm, 0.0, 1.0);
        uintc = hover[input.start].color;
    }
    if (input.vert == 2) {
        output.pos = vec4f(map2f(endPosition) - norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (input.vert == 3) {
        output.pos = vec4f(map2f(endPosition) - norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (input.vert == 4) {
        output.pos = vec4f(map2f(endPosition) + norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (input.vert == 5) {
        output.pos = vec4f(map2f(startPosition) + norm, 0.0, 1.0);
        uintc = hover[input.start].color;
    }

    output.color = intToColor(uintc);
    output.color.a = 0.5;

    return output;
}

struct FragInput {
    @location(0) color: vec4f,
};

@fragment
fn fragmentMain(input: FragInput) -> @location(0) vec4f {
    return input.color;
}