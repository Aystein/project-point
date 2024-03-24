
struct Uniforms {
    xdomain: vec2f,
    ydomain: vec2f,
    sizeX: f32,
    sizeY: f32
}

@group(0) @binding(0) var<storage, read> hover: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) p0: u32,
    @location(1) start: u32,
    @location(2) end: u32,
    @location(3) p3: u32,

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

fn catmull(p0: vec2f, p1: vec2f, p2: vec2f, p3: vec2f, t: f32) -> vec2f {
    let q0 = (-1 * pow(t, 3.0)) + (2 * pow(t, 2.0)) + (-1 * t);
    let q1 = (3 * pow(t, 3.0)) + (-5 * pow(t, 2.0)) + 2;
    let q2 = (-3 * pow(t, 3.0)) + (4 * pow(t, 2.0)) + t;
    let q3 = pow(t, 3.0) - pow(t, 2.0);

    return vec2f(
        0.5 * ((p0[0] * q0) + (p1[0] * q1) + (p2[0] * q2) + (p3[0] * q3)),
        0.5 * ((p0[1] * q0) + (p1[1] * q1) + (p2[1] * q2) + (p3[1] * q3)),
    );
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
    var output: VertexOutput;

    output.pos = vec4f(1.0, 1.0, 0.0, 1.0);

    var uii = uniforms;

    var p1 = hover[input.start].position;
    var p2 = hover[input.end].position;

    var p0 = hover[input.start].position;
    if (input.p0 < 100000) {
        p0 = hover[input.p0].position;
    }

    var p3 = hover[input.end].position;;
    if (input.p3 < 100000) {
        p3 = hover[input.p3].position;
    }

    var ps = catmull(p0, p1, p2, p3, f32(input.vert / 6) / 40.0);
    var pe = catmull(p0, p1, p2, p3, f32((input.vert / 6) + 1) / 40.0);

    output.pos = vec4f(0.0, 0.0, 0.0, 1.0);

    var direction = ps - pe;
    var norm = normalize(vec2f(direction.y, direction.x)) * 0.0016;

    var uintc = 0u;

    var segmentIndex = input.vert % 6;
    
    if (segmentIndex == 0) {
        output.pos = vec4f(map2f(ps) - norm, 0.0, 1.0);
        uintc = hover[input.start].color;
    }
    if (segmentIndex == 1) {
        output.pos = vec4f(map2f(ps) + norm, 0.0, 1.0);
        uintc = hover[input.start].color;
    }
    if (segmentIndex == 2) {
        output.pos = vec4f(map2f(pe) - norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (segmentIndex == 3) {
        output.pos = vec4f(map2f(pe) - norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (segmentIndex == 4) {
        output.pos = vec4f(map2f(pe) + norm, 0.0, 1.0);
        uintc = hover[input.end].color;
    }
    if (segmentIndex == 5) {
        output.pos = vec4f(map2f(ps) + norm, 0.0, 1.0);
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