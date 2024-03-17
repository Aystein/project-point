struct Uniforms {
    xdomain: vec2f,
    ydomain: vec2f,
    sizeX: f32,
    sizeY: f32
}

@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@group(0) @binding(3) var<storage, read> particleBuffer: array<Particle>;


fn map(x: f32, in_min: f32, in_max: f32, out_min: f32, out_max: f32) -> f32
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

struct VertexInput {
    @location(0) vertexPosition: vec2f,
    @location(1) texCoord: vec2f,

    @builtin(instance_index) vertexIndex: u32,
};
  
struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) texCoord: vec2f,
    @location(1) color: vec4f,
};


@vertex
fn vertexMain(input: VertexInput) -> VertexOutput  {
    var output: VertexOutput;

    var particle = particleBuffer[input.vertexIndex];
    var copy: Particle;

    var isShadow = particle.copyOf < 1000000;

    if (isShadow) {
        copy = particleBuffer[particle.copyOf];
    }

    let dim = vec2f(2, 4);

    output.pos = vec4f(map(particle.position.x, uniforms.xdomain.x, uniforms.xdomain.y, -1, 1) + input.vertexPosition.x * uniforms.sizeX, map(particle.position.y, uniforms.ydomain.x, uniforms.ydomain.y, 1, -1) + input.vertexPosition.y * uniforms.sizeY, 0, 1);
    
    var uintc: u32 = particle.color;
    if (isShadow) {
        uintc = copy.color;
    }
    let r = (uintc >> 24) & 0xff;
    let g = (uintc >> 16) & 0xff;
    let b = (uintc >> 8) & 0xff;
    let a = uintc & 0xff;
    output.color.x = f32(r) / 255;
    output.color.y = f32(g) / 255;
    output.color.z = f32(b) / 255;
    output.color.a = f32(a) / 255;

    if (particle.selected > 0 || (isShadow && copy.selected > 0)) {
        output.color = vec4(0.8, 0.0, 0.0, 1.0);
    } else {
        //output.color = input.color;
    }

    var shape = particle.shape;
    shape = 0;
    if (particle.hover > 0 || (isShadow && copy.hover > 0)) {
        output.color = output.color * 1.5;
        shape = shape + 4;
    } else {
        output.color = output.color;
    }

    if (isShadow) {
        shape = 1;
        // output.color = output.color * 0.9;
    }

    output.texCoord =
        (input.texCoord / dim) +
        vec2f(shape % dim.x, floor(shape / dim.y)) / dim;

    return output;
}

struct FragInput {
    @location(0) texCoord: vec2f,
    @location(1) color: vec4f,
};

fn PixelShaderFunction(texCoord : vec2f) -> vec4f
{
    let dist = texCoord.x * texCoord.x
               + texCoord.y * texCoord.y;
    if(dist < 1.0) {
        return vec4f(0, 0, 0, 1);
    }
    else {
        return vec4f(1, 1, 1, 1);
    }
}

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