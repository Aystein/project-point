import CountParticlesPerCell from "../shaders/engine/indexing/count-particles-per-cell.wgsl?raw";
import FinalizePrefixSum from "../shaders/engine/indexing/finalize-prefix-sum.wgsl?raw";
import DownPass from "../shaders/engine/indexing/prefix-sum/down-pass.wgsl?raw";
import Reduce from "../shaders/engine/indexing/prefix-sum/reduce.wgsl?raw";
import PreparePrefixSum from "../shaders/engine/indexing/prepare-prefix-sum.wgsl?raw";
import RenderCellsByPopulation from "../shaders/engine/indexing/render-cells-by-population.wgsl?raw";
import ReorderParticles from "../shaders/engine/indexing/reorder-particles.wgsl?raw";
import ResetCells from "../shaders/engine/indexing/reset-cells.wgsl?raw";

import Acceleration from "../shaders/engine/simulation/acceleration.wgsl?raw";
import Initialization from "../shaders/engine/simulation/initialization.wgsl?raw";
import Integration from "../shaders/engine/simulation/integration.wgsl?raw";
import ObstaclesRotation from "../shaders/engine/simulation/obstacles-rotation.wgsl?raw";

import Axes from "../shaders/rendering/axes.wgsl?raw";
import Cube from "../shaders/rendering/cube.wgsl?raw";
import GridCells from "../shaders/rendering/grid-cells.wgsl?raw";
import Mesh from "../shaders/rendering/mesh.wgsl?raw";
import Blur from "../shaders/rendering/spheres/blur.wgsl?raw";
import Composition from "../shaders/rendering/spheres/composition.wgsl?raw";
import Spheres from "../shaders/rendering/spheres/spheres.wgsl?raw";

const engine = {
    Indexing: {
        CountParticlesPerCell,
        FinalizePrefixSum,
        PreparePrefixSum,
        RenderCellsByPopulation,
        ReorderParticles,
        ResetCells,
        PrefixSum: {
            DownPass,
            Reduce,
        },
    },
    Simulation: {
        Acceleration,
        Initialization,
        Integration,
        ObstaclesRotation,
    },
};

const rendering = {
    Axes,
    Cube,
    GridCells,
    Mesh,
    Spheres: {
        Blur,
        Composition,
        Spheres,
    },
};

export {
    engine as Engine,
    rendering as Rendering,
};

