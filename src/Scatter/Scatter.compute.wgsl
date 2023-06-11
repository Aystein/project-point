struct Particle {
    position: vec2<f32>
}

struct Particles {
    particles: array<Particle>
}

@group(0) @binding(0) var<storage, read_write> hover: array<Particle>;
@group(0) @binding(1) var<storage, read_write> targetPosition: array<Particle>;

@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
    let x = 4;
    let m = targetPosition[0];
    let k = hover[0];

    let a = hover[cell.x].position;
    let b = targetPosition[cell.x].position;

    let dist = distance(a, b);

    let dvec = normalize(b - a) * dist * 0.05;
    hover[cell.x].position = a + dvec;
}