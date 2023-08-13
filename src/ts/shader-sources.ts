import CountParticlesPerCell from "../shaders/engine/indexing/count-particles-per-cell.wgsl?raw";
import FinalizePrefixSum from "../shaders/engine/indexing/finalize-prefix-sum.wgsl?raw";
import DownPass from "../shaders/engine/indexing/prefix-sum/down-pass.wgsl?raw";
import Reduce from "../shaders/engine/indexing/prefix-sum/reduce.wgsl?raw";
import PreparePrefixSum from "../shaders/engine/indexing/prepare-prefix-sum.wgsl?raw";
import ReorderParticles from "../shaders/engine/indexing/reorder-particles.wgsl?raw";
import ResetCells from "../shaders/engine/indexing/reset-cells.wgsl?raw";

import Acceleration from "../shaders/engine/simulation/acceleration.wgsl?raw";
import Initialization from "../shaders/engine/simulation/initialization.wgsl?raw";
import SetPositions from "../shaders/engine/simulation/set_positions.wgsl?raw";
import SetSelection from "../shaders/engine/simulation/set_selection.wgsl?raw";
import Integration from "../shaders/engine/simulation/integration.wgsl?raw";


const engine = {
    Indexing: {
        CountParticlesPerCell,
        FinalizePrefixSum,
        PreparePrefixSum,
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
        SetPositions,
        SetSelection,
    },
};

export {
    engine as Engine,
};

